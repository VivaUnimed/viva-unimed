import type { AppointmentMatchStatus, AppointmentRequestStatus, IAppointmentMatch, IAppointmentRequest, IAppointmentRequestCreate, IAppointmentRequestListParams } from "shared";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import { Conflict, NotFound } from "../error";
import { Op, WhereOptions } from "sequelize";
import AppointmentModel from "../db/models/appointment.model";
import AppointmentMatchModel from "../db/models/appointment_match.model";
import { paginate } from "./helpers";
import SpecialityModel from "../db/models/speciality.model";
import { db } from "../db";
import { IConfig } from "../config";
import DoctorSpecialityModel from "../db/models/doctor.speciality.model";
import { HOUR, MINUTE } from "../constants";

/**
 * Serviço responsável pelas operações de pedido de consulta.
 * Gerencia a criação, atualização, consulta e exclusão
 * de `appointment_request` no banco de dados.
 */
export class AppointmentRequestService {
  constructor(private config: IConfig) {}

  /**
   * Cria um novo pedido de consulta.
   * Retorna o registro criado em formato plain object.
   */
  async create(data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    if (data.doctorId) {
      const doctorSpecialityBind = await DoctorSpecialityModel.findOne({
        where: {
          userId: data.doctorId,
          specialityId: data.specialityId
        }
      });

      if (!doctorSpecialityBind) {
        throw new Conflict("O médico selecionado não realiza atendimentos para a especialidade informada.");
      }
    }

    // trava de duplicidade
    const found = await AppointmentRequestModel.findOne({
      where: {
        patientId: data.patientId,
        specialityId: data.specialityId,
        status: 'waiting' satisfies AppointmentRequestStatus,
      }
    })
    if(found) {
      throw new Conflict("O paciente já possui uma solicitação ativa na fila de espera para esta especialidade.");
    }

    const model = await AppointmentRequestModel.create({
      ...data,
      attempts: 0,
      cooldownUntil: null,
    });
    return model.get({ plain: true });
  }

  /**
   * Atualiza um pedido de consulta existente.
   * Lança NotFound se o ID não existir.
   */
  async update(id: number, data: Partial<IAppointmentRequestCreate>): Promise<IAppointmentRequest> {
    // TODO: e se já foi confirmada?
    const model = await AppointmentRequestModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.update(data);
    return model.get({ plain: true });
  }

  /**
   * Busca um pedido de consulta pelo ID.
   * Lança NotFound se não encontrar o registro.
   */
  async getById(id: number): Promise<IAppointmentRequest> {
    const model = await AppointmentRequestModel.findByPk(id);
    if(!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  /**
   * Lista todos os pedidos de consulta cadastrados.
   * Aplica filtros dinâmicos, paginação, ordenação cronológica e inclui dados relacionais.
   */
  async list(params: IAppointmentRequestListParams = {}): Promise<IAppointmentRequest[]> {
    const { patientId, specialityId, status, doctorId } = params;
    const where: WhereOptions<IAppointmentRequest> = { };

    if(patientId) where.patientId = patientId;
    if(specialityId) where.specialityId = specialityId;
    if(status) where.status = status;
    if(doctorId) where.doctorId = doctorId;

    const list = await AppointmentRequestModel.findAll({
      where,
      ...paginate(params),
      order: [['createdAt', 'DESC']]
    });
    return list.map((model) => model.get({ plain: true }))
  }

  /**
   * Remove o paciente da fila de espera (queue.leave).
   */
  async delete(id: number): Promise<void> {
    const request = await AppointmentRequestModel.findByPk(id);
    if(!request) {
      throw new NotFound();
    }

    // se a solicitação já virou uma consulta confirmada, usar a rota de cancelamento de consulta.
    if (request.status === 'approved') {
      throw new Conflict("Esta solicitação já gerou uma consulta confirmada. Use a opção de cancelar a consulta.");
    }

    const transaction = await db.transaction();
    try {
      // se há alguma vaga (match) pendente oferecida a este paciente agora
      const pendingMatch = await AppointmentMatchModel.findOne({
        where: {
          requestId: id,
          status: { [Op.in]: ['queued', 'waiting_response'] satisfies AppointmentMatchStatus[] }
        },
        transaction
      });

      // se o paciente estava com uma vaga e saiu da fila, rejeitar o match para a fila passar a vaga para o próximo
      if (pendingMatch) {
        await pendingMatch.update({ status: 'rejected' }, { transaction });
      }

      await request.update({ status: 'cancelled' }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }


  async getNextBatchByAppointmentId(appointmentId: number, limit: number): Promise<IAppointmentRequest[]> {
    const appointment = await AppointmentModel.findByPk(appointmentId);
    if(!appointment || appointment.status !== "open") {
      throw new Error("appointment is not open");
    }

        const alreadySent = await AppointmentMatchModel.findAll({
      where: { appointmentId },
      attributes: ['requestId'],
    });

    const activeRequests = await AppointmentMatchModel.findAll({
      where: {
        status: {
          [Op.in]: ['queued', 'waiting_response'] satisfies AppointmentMatchStatus[],
        },
      },
      attributes: ['requestId'],
    });

    const maxAttempts = this.config.APPOINTMENT_REQUEST_MAX_ATTEMPTS;
    const now = new Date();

    const request = await AppointmentRequestModel.findAll({
      where: {
        status: "waiting" satisfies AppointmentRequestStatus,
        specialityId: appointment.specialityId,
        doctorId: {
          [Op.or]: [appointment.doctorId, null],
        },
        attempts: {
          [Op.lt]: maxAttempts,
        },
        cooldownUntil: {
          [Op.or]: [{ [Op.lte]: now }, null],
        },
        id: {
          [Op.notIn]: [
            ...alreadySent.map(a => a.requestId),
            ...activeRequests.map(a => a.requestId),
          ],
        },
      },
      order: [['createdAt', 'ASC']],
      limit,
    });
    return request.map(r => r.get({ plain: true }));
  }

  async getQueueSizeForAppointment(appointmentId: number): Promise<number> {
    const appointment = await AppointmentModel.findByPk(appointmentId);
    if (!appointment) return 0;

    const count = await AppointmentRequestModel.count({
      where: {
        status: "waiting",
        specialityId: appointment.specialityId,
        doctorId: {
          [Op.or]: [appointment.doctorId, null],
        },
      }
    });

    return count;
  }

  async listMatchesToNotify() {
    const res = await AppointmentMatchModel.findAll({
     where: {
        status: "queued" satisfies AppointmentMatchStatus,
      },
      include: [
        {
          model: AppointmentModel,
          include: [
            SpecialityModel,
          ]
        },
        {
          model: AppointmentRequestModel,
        }
      ]
    });
    return res.map(model => model.get({ plain: true }));
  }

  async updateMatchStatus(matchId: number, status: AppointmentMatchStatus){
    const found = await AppointmentMatchModel.findByPk(matchId, {
      include: [AppointmentRequestModel],
    });
    if(!found){
      throw new NotFound();
    }

    await found.update({
      status,
    });

    if (status === 'expired' || status === 'rejected') {
      const request = found.request;
      if (request) {
        const newAttempts = (request.attempts ?? 0) + 1;
        const backoffMinutes = this.config.APPOINTMENT_REQUEST_BACKOFF_MINUTES * Math.pow(this.config.APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER, newAttempts - 1);
        const cooldownUntil = new Date(Date.now() + backoffMinutes * 60 * 1000);
        await AppointmentRequestModel.update({
          attempts: newAttempts,
          cooldownUntil,
        }, {
          where: { id: request.id },
        });
      }
    }
  }

  async getMatch(matchId: number): Promise<IAppointmentMatch> {
    const match = await AppointmentMatchModel.findByPk(matchId, {
      include: [
        {
          model: AppointmentModel,
          include: [{
            model: SpecialityModel,
          }]
        },
        { model: AppointmentRequestModel },
      ],
    });
    if (!match) {
      throw new NotFound();
    }
    return match.get({ plain: true });
  }

  async confirmMatch(matchId: number): Promise<void> {
    const match = await this.getMatch(matchId);

    if(match.appointment.status !== 'open') throw new Conflict('appointment status is not open');
    if(match.request.status !== 'waiting') throw new Conflict('request status is not waiting');
    if(match.status !== 'waiting_response') throw new Conflict('match status is not waiting_response');
    if(match.expiresAt && match.expiresAt < new Date()) throw new Conflict('match expired');

    const transaction = await db.transaction();
    try {
      await AppointmentMatchModel.update({ status: 'accepted' }, {
        where: { id: match.id },
        transaction,
      });
      await AppointmentModel.update({ status: 'booked' }, {
        where: { id: match.appointment.id },
        transaction,
      });
      await AppointmentMatchModel.update({ status: 'cancelled' }, {
      where: {
        appointmentId: match.appointmentId,
        id: { [Op.ne]: match.id } // Atualiza todos daquela vaga, MENOS o do vencedor
      },
      transaction // Importante manter na mesma transação
    });
      await AppointmentRequestModel.update({ status: 'approved' }, {
        where: { id: match.request.id },
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

/**
   * Desfaz a confirmação de um match aceito por engano ou por desistência.
   * Valida regras de tempo (24h de antecedência ou 15 min de arrependimento).
   * Reabre a vaga, volta o pedido para a fila e cancela o match atual.
   */
  async cancelMatch(matchId: number): Promise<void> {
    const match = await this.getMatch(matchId);

    // 1. Validação de status
    if (match.status !== 'accepted') {
      throw new Conflict('Only accepted matches can be undone');
    }

    // 2. Cálculo das janelas de tempo
    const now = new Date().getTime();
    const acceptedAt = new Date(match.updatedAt).getTime();
    const appointmentDate = new Date(match.appointment.date).getTime();

    const timeSinceAccepted = now - acceptedAt;
    const timeUntilAppointment = appointmentDate - now;

    const maxAllowedToCancel = 15 * MINUTE;
    const maxAllowedTimeToCancelSchedule = 24 * HOUR;

    // 3. Aplicação das Regras de Negócio

    // Regra A: A consulta já passou?
    if (timeUntilAppointment < 0) {
      throw new Conflict('Cannot undo a past appointment.');
    }

    // Regra B: Faltam menos de 24h para a consulta E já passou o prazo de 15 min para desfazer o clique errado?
    const isTooCloseToAppointment = timeUntilAppointment < maxAllowedTimeToCancelSchedule;
    const isPastUndoWindow = timeSinceAccepted > maxAllowedToCancel;

    if (isTooCloseToAppointment && isPastUndoWindow) {
      throw new Conflict('Cannot undo: less than 24 hours to the appointment and the 15-minute grace period has expired.');
    }

    // 4. Se passou nas validações, executa a transação
    const transaction = await db.transaction();
    try {
      // Invalida o match atual
      await AppointmentMatchModel.update({ status: 'cancelled' }, {
        where: { id: match.id },
        transaction,
      });

      // Reabre a vaga na agenda
      await AppointmentModel.update({ status: 'open' }, {
        where: { id: match.appointment.id },
        transaction,
      });

      // Devolve o paciente para a fila
      await AppointmentRequestModel.update({ status: 'waiting' }, {
        where: { id: match.request.id },
        transaction,
      });

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  /**
   * Chamado quando o paciente clica em "Recusar" na notificação da vaga.
   * Marca o match como rejeitado e aplica a penalidade de tempo (cooldown)
   * para que ele vá para o final da fila.
   */
  async rejectMatch(matchId: number): Promise<void> {
    const match = await this.getMatch(matchId);

    if(match.status !== 'waiting_response' && match.status !== 'queued') {
      throw new Conflict(`A vaga não pode ser recusada no status atual (${match.status}).`);
    }
    // chama o método que já contém a regra de negócio do backoff (cooldown) para rejeições!
    await this.updateMatchStatus(matchId, 'rejected');
  }

  async setExpiredStatus() {
    const expiredMatches = await AppointmentMatchModel.findAll({
      where: {
        status: {
          [Op.in]: ['waiting_response', 'queued'] satisfies AppointmentMatchStatus[],
        },
        expiresAt: {
          [Op.lte]: new Date(),
        },
      },
      include: [AppointmentRequestModel],
    });

    for (const match of expiredMatches) {
      await this.updateMatchStatus(match.id, 'expired');
    }
  }
}

