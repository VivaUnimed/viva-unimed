import { IAppointment, IAppointmentCreate, AppointmentStatus, IAppointmentMatchCreate, AppointmentRequestStatus, IAppointmentRequest, AppointmentMatchStatus } from "shared";
import AppointmentModel from "../db/models/appointment.model";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import DoctorSpecialityModel from "../db/models/doctor.speciality.model";
import { NotFound, Conflict, BadRequest } from "../error";
import AppointmentMatchModel from "../db/models/appointment_match.model";
import { Op, Transaction } from "sequelize";
import { db } from "../db";
import provider from "../provider";
import { IConfig } from "../config";

export class AppointmentService {
  constructor(private config: IConfig) {}

  // Máquina de estados: define os fluxos permitidos de status
  private readonly ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
    open: ['booked', 'expired'],
    booked: ['cancelled', 'no_show'],
    expired: [],
    cancelled: [],
    no_show: []
  };

  // Garante que o status siga a máquina de estados e gera log em falhas
  private validateStatusTransition(current: AppointmentStatus, next: AppointmentStatus): void {
    if (current === next) return;

    const allowed = this.ALLOWED_TRANSITIONS[current];
    if (!allowed || !allowed.includes(next)) {
      console.error(`[AUDIT] Tentativa inválida de transição de status: de "${current}" para "${next}"`);
      throw new BadRequest(`Transição de status inválida: não é permitido alterar de "${current}" para "${next}".`);
    }
  }

  // Verifica se o médico atende à especialidade (permite nulo para vaga genérica)
  private async validateDoctorSpeciality(doctorId: number | null | undefined, specialityId: number | undefined): Promise<void> {
    if (!doctorId) {
      return;
    }

    if (!specialityId) {
      throw new Error("specialityId é obrigatório quando um doctorId é informado.");
    }

    // CORREÇÃO APLICADA AQUI: Usando 'userId' (nome da coluna no banco)
    // e passando o valor da variável 'doctorId'. Remoção do 'as any'.
    const hasSpeciality = await DoctorSpecialityModel.findOne({
      where: {
        userId: doctorId,
        specialityId: specialityId
      }
    });

    if (!hasSpeciality) {
      throw new Conflict(`O médico selecionado não possui vínculo com a especialidade exigida (ID: ${specialityId}).`);
    }
  }

  // Impede criação/edição no passado ou abaixo do tempo mínimo de antecedência
  private validateAppointmentDate(dateInput: Date | string | undefined): void {
    if (!dateInput) {
      return;
    }

    const appointmentDate = new Date(dateInput);
    const now = new Date();

    if (appointmentDate < now) {
      throw new BadRequest("Não é possível agendar uma vaga com data e hora passadas.");
    }

    const minimumAllowedDate = new Date(now.getTime() + this.config.APPOINTMENT_MIN_LEAD_MINUTES * 60000);
    if (appointmentDate < minimumAllowedDate) {
      throw new BadRequest(
        `A vaga deve ser criada com uma antecedência mínima de ${this.config.APPOINTMENT_MIN_LEAD_MINUTES} minutes.`
      );
    }
  }

  // Busca conflitos na agenda do médico usando lock pessimista (estratégia de controle de concorrência em bd)
  private async validateDoctorAvailability(
    doctorId: number | null | undefined,
    dateInput: Date | string | undefined,
    excludeAppointmentId?: number,
    transaction?: Transaction
  ): Promise<void> {
    if (!doctorId || !dateInput) {
      return;
    }

    const targetDate = new Date(dateInput);
    const slotMs = this.config.APPOINTMENT_SLOT_MINUTES * 60 * 1000;
    const dateStart = new Date(targetDate.getTime() - slotMs);
    const dateEnd = new Date(targetDate.getTime() + slotMs);

    const whereCondition: any = {
      doctorId,
      status: { [Op.in]: ['open', 'booked'] },
      date: {
        [Op.between]: [dateStart.toISOString(), dateEnd.toISOString()]
      }
    };

    // Ignora o próprio ID na checagem em caso de atualização
    if (excludeAppointmentId) {
      whereCondition.id = { [Op.ne]: excludeAppointmentId };
    }

    const conflictingAppointment = await AppointmentModel.findOne({
      where: whereCondition,
      lock: transaction ? transaction.LOCK.UPDATE : false,
      transaction
    });

    if (conflictingAppointment) {
      throw new Conflict("doctor double booked");
    }
  }

  /** Cria um novo agendamento */
  async create(data: Omit<IAppointmentCreate, 'status'>): Promise<IAppointment> {
    await this.validateDoctorSpeciality(data.doctorId, data.specialityId);
    this.validateAppointmentDate(data.date);

    // Normaliza a data de entrada para o padrão UTC do banco
    const normalizedDate = data.date ? new Date(data.date).toISOString() : undefined;

    const t = await db.transaction();
    try {
      await this.validateDoctorAvailability(data.doctorId, normalizedDate, undefined, t);

      const model = await AppointmentModel.create({
        ...data,
        date: normalizedDate as any,
        status: 'open',
      }, { transaction: t });

      await t.commit();
      return model.get({ plain: true });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /** Atualiza um agendamento existente */
  async update(id: number, data: Partial<IAppointmentCreate>): Promise<IAppointment> {
    const model = await AppointmentModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }

    if (data.status !== undefined) {
      this.validateStatusTransition(model.status, data.status);
    }

    // Combina dados novos com os já salvos para validar a especialidade
    const doctorIdToCheck = data.doctorId !== undefined ? data.doctorId : model.doctorId;
    const specialityIdToCheck = data.specialityId !== undefined ? data.specialityId : model.specialityId;
    await this.validateDoctorSpeciality(doctorIdToCheck, specialityIdToCheck);

    if (data.date !== undefined) {
      this.validateAppointmentDate(data.date);
      data.date = new Date(data.date).toISOString() as any;
    }
    const dateToCheck = data.date !== undefined ? data.date : model.date;

    const t = await db.transaction();
    try {
      await this.validateDoctorAvailability(doctorIdToCheck, dateToCheck, id, t);

      await model.update(data, { transaction: t });
      await t.commit();
      return model.get({ plain: true });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /** Vincula um paciente da fila a uma vaga disponível */
  async addMatch(data: IAppointmentMatchCreate) {
    const appointment = await AppointmentModel.findByPk(data.appointmentId);
    if (!appointment) {
      throw new NotFound();
    }
    if (appointment.status !== 'open') {
      throw new Conflict(`appointment ${data.appointmentId} is not open for matching`);
    }

    const request = await AppointmentRequestModel.findByPk(data.requestId);
    if (!request) {
      throw new NotFound();
    }
    if (request.status !== 'waiting') {
      throw new Conflict(`request ${data.requestId} is not waiting for an appointment`);
    }
    //trava temporária de segurança (ou penalidade) aplicada ao pedido do paciente
    if (request.cooldownUntil && request.cooldownUntil > new Date()) {
      throw new Conflict(`request ${data.requestId} is in cooldown until ${request.cooldownUntil.toISOString()}`);
    }
    if (request.attempts >= this.config.APPOINTMENT_REQUEST_MAX_ATTEMPTS) {
      throw new Conflict(`request ${data.requestId} has reached the maximum number of notification attempts`);
    }

    const pendingRequestMatch = await AppointmentMatchModel.findOne({
      where: {
        requestId: data.requestId,
        status: {
          [Op.in]: ['queued', 'waiting_response'] satisfies AppointmentMatchStatus[],
        },
      },
    });
    if (pendingRequestMatch) {
      throw new Conflict(`request ${data.requestId} already has an active match`);
    }

    const found = await AppointmentMatchModel.findOne({
      where: {
        appointmentId: data.appointmentId,
        requestId: data.requestId,
      }
    });
    if(found) {
      throw new Conflict(`match already exists for appointment ${data.appointmentId} and request ${data.requestId}`);
    }

    const model = await AppointmentMatchModel.create(data);
    return model.get({ plain: true });
  }

  /** Verifica se a vaga já possui algum match ativo ou em andamento */
  async hasPendingMatch(appointmentId: number): Promise<boolean> {
    const match = await AppointmentMatchModel.findOne({
      where: {
        appointmentId,
        status: {
          [Op.or]: ["accepted", "queued", "success", "waiting_response"] satisfies AppointmentMatchStatus[],
        }
      },
      attributes: ["id"],
    });
    return !!match;
  }

  /** Rotina/Cron: Expira vagas abertas cujo horário já passou */
  async setExpiredPastAppointment(): Promise<void>{
    await AppointmentModel.update(
      { status: 'expired' },
      { where: {
        status: 'open',
        date: {
          [Op.lt]: new Date(),
        },
      }
    }
    );
  }

  /** Busca agendamento por ID */
  async getById(id: number): Promise<IAppointment> {
    const model = await AppointmentModel.findByPk(id, {
      include: [
        {
          association: 'doctor',
          attributes: ['crm', 'enabled', 'userId']
        },
        {
          association: 'speciality',
          attributes: ['id', 'name']
        },
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'cpf', 'phone']
        }
      ]
    });
    if (!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  /** Lista todos os agendamentos */
  async list(): Promise<IAppointment[]> {
    const list = await AppointmentModel.findAll({
      include: [
        {
          association: 'doctor',
          attributes: ['crm', 'enabled', 'userId']
        },
        {
          association: 'speciality',
          attributes: ['id', 'name']
        },
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'cpf', 'phone']
        }
      ]
    });
    return list.map((model) => model.get({ plain: true }));
  }

  /** Lista apenas as vagas disponíveis (abertas) */
  async listOpen(): Promise<IAppointment[]> {
    const status: AppointmentStatus = "open";
    const list = await AppointmentModel.findAll({
      where: {
        status,
      },
    })
    return list.map(v => v.get({ plain: true }));
  }

  /** Confirma a reserva da vaga para um paciente */
  async reserved(appointmentId: number): Promise<void> {
    const appointment = await this.getById(appointmentId);
    if (!appointment) {
      throw new NotFound();
    }
    await this.update(appointmentId, { status: 'booked' } as Partial<IAppointmentCreate>);
  }

  /** Remove com segurança uma vaga do sistema (Exclusão Segura) */
  async delete(id: number): Promise<void> {
    const model = await AppointmentModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }

    // Bloqueia exclusão caso a vaga tenha sido reservada ou tenha no-show no histórico
    if (model.status === 'booked' || model.status === 'no_show') {
      throw new BadRequest("Não é possível remover uma vaga que já foi reservada ou possui histórico de atendimento. Utilize o fluxo de cancelamento.");
    }

    const t = await db.transaction();
    try {
      // Bloqueia se houver algum match aceito ou finalizado com sucesso
      const criticalMatch = await AppointmentMatchModel.findOne({
        where: {
          appointmentId: id,
          status: { [Op.in]: ['accepted', 'success', 'booked'] }
        },
        transaction: t
      });

      if (criticalMatch) {
        throw new Conflict("Não é possível deletar esta vaga pois ela possui matches ativos ou aceitos em andamento.");
      }

      // Cancela em lote os candidatos pendentes/em fila para liberar a triagem
      await AppointmentMatchModel.update(
        { status: 'cancelled' },
        {
          where: {
            appointmentId: id,
            status: { [Op.in]: ['waiting_response', 'queued', 'pending'] as any }
          },
          transaction: t
        }
      );

      console.log(`[AUDIT] Exclusão segura executada para o Appointment ID: ${id}. Matches pendentes foram cancelados.`);

      await model.destroy({ transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /** Cancela uma consulta já agendada por um paciente */
  async cancel(id: number, reason: string): Promise<IAppointment> {
    const appointment = await AppointmentModel.findByPk(id, {
      include: ["user", "speciality"]
    });

    if (!appointment) {
      throw new NotFound();
    }

    this.validateStatusTransition(appointment.status, 'cancelled');

    await appointment.update({ status: 'cancelled' });

    // Invalida o match que gerou o agendamento de sucesso
    await AppointmentMatchModel.update(
      { status: 'cancelled' },
      { where: { appointmentId: id, status: 'success' } }
    );

    const appointmentData = appointment.get({ plain: true });

    if (appointmentData.user && appointmentData.speciality) {
      provider.notification.sendCancellationNotification({
        appointment: appointmentData,
        speciality: appointmentData.speciality,
        user: appointmentData.user,
        reason
      });
    }

    return appointmentData;
  }
}
