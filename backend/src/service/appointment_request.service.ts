import type { AppointmentMatchStatus, AppointmentRequestStatus, IAppointmentMatch, IAppointmentRequest, IAppointmentRequestCreate, IAppointmentRequestListParams, IAppointmentRequestPatientCreate, IAppointmentRequestPatientListParams } from "shared";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import { Conflict, NotFound } from "../error";
import { Op, Transaction, WhereOptions } from "sequelize";
import AppointmentModel from "../db/models/appointment.model";
import AppointmentMatchModel from "../db/models/appointment_match.model";
import { paginate } from "./helpers";
import SpecialityModel from "../db/models/speciality.model";
import { db } from "../db";
import { IConfig } from "../config";
import DoctorSpecialityModel from "../db/models/doctor.speciality.model";
import { HOUR, MINUTE } from "../constants";
import DoctorModel from "../db/models/doctor.model";
import UserModel from "../db/models/user.model";
import PatientModel from "../db/models/patient.model";

/**
 * Serviço responsável pelas operações de pedido de consulta.
 * Gerencia a criação, atualização, consulta e exclusão
 * de `appointment_request` no banco de dados.
 */
export class AppointmentRequestService {
  constructor(private config: IConfig) {}


  /** Converte users.id do JWT para patients.id. */
  private async getPatientProfileId(
    patientUserId: number,
    transaction?: Transaction,
  ): Promise<number> {
    const patient = await PatientModel.findOne({
      where: { userId: patientUserId },
      transaction,
    });

    if (!patient) throw new NotFound("Paciente não encontrado.");
    return patient.id;
  }

  /** Cria uma solicitação para o paciente autenticado, sem receber patientId. */
  async createForPatient(
    patientUserId: number,
    data: IAppointmentRequestPatientCreate,
  ): Promise<IAppointmentRequest> {
    const patientId = await this.getPatientProfileId(patientUserId);

    if (data.doctorId) {
      const doctorSpecialityBind = await DoctorSpecialityModel.findOne({
        where: {
          userId: data.doctorId,
          specialityId: data.specialityId,
        },
      });

      if (!doctorSpecialityBind) {
        throw new Conflict(
          "O médico selecionado não realiza atendimentos para a especialidade informada.",
        );
      }
    }

    const found = await AppointmentRequestModel.findOne({
      where: {
        patientId,
        specialityId: data.specialityId,
        status: "waiting" satisfies AppointmentRequestStatus,
      },
    });

    if (found) {
      throw new Conflict(
        "O paciente já possui uma solicitação ativa na fila de espera para esta especialidade.",
      );
    }

    const model = await AppointmentRequestModel.create({
      ...data,
      patientId,
      status: "waiting",
      attempts: 0,
      cooldownUntil: null,
    });

    return model.get({ plain: true });
  }

  /** Atualiza somente uma solicitação pertencente ao paciente autenticado. */
  async updateForPatient(
    id: number,
    patientUserId: number,
    data: Partial<IAppointmentRequestPatientCreate>,
  ): Promise<IAppointmentRequest> {
    const patientId = await this.getPatientProfileId(patientUserId);
    const model = await AppointmentRequestModel.findOne({
      where: { id, patientId },
    });

    if (!model) throw new NotFound();

    if (data.doctorId !== undefined && data.doctorId !== null) {
      const specialityId = data.specialityId ?? model.specialityId;
      const doctorSpecialityBind = await DoctorSpecialityModel.findOne({
        where: { userId: data.doctorId, specialityId },
      });
      if (!doctorSpecialityBind) {
        throw new Conflict(
          "O médico selecionado não realiza atendimentos para a especialidade informada.",
        );
      }
    }

    const nextSpecialityId = data.specialityId ?? model.specialityId;
    if (nextSpecialityId !== model.specialityId) {
      const duplicate = await AppointmentRequestModel.findOne({
        where: {
          id: { [Op.ne]: id },
          patientId,
          specialityId: nextSpecialityId,
          status: "waiting" satisfies AppointmentRequestStatus,
        },
      });
      if (duplicate) {
        throw new Conflict(
          "O paciente já possui uma solicitação ativa na fila de espera para esta especialidade.",
        );
      }
    }

    await model.update(data);
    return model.get({ plain: true });
  }

  async getByIdForPatient(
    id: number,
    patientUserId: number,
  ): Promise<IAppointmentRequest> {
    const patientId = await this.getPatientProfileId(patientUserId);
    const model = await AppointmentRequestModel.findOne({
      where: { id, patientId },
    });
    if (!model) throw new NotFound();
    return model.get({ plain: true });
  }

  async listForPatient(
    patientUserId: number,
    params: IAppointmentRequestPatientListParams = {},
  ): Promise<IAppointmentRequest[]> {
    const patientId = await this.getPatientProfileId(patientUserId);
    const { specialityId, status, doctorId } = params;
    const where: WhereOptions<IAppointmentRequest> = { patientId };

    if (specialityId) where.specialityId = specialityId;
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;

    const list = await AppointmentRequestModel.findAll({
      where,
      ...paginate(params),
      order: [["createdAt", "DESC"]],
    });

    return list.map((model) => model.get({ plain: true }));
  }

  async deleteForPatient(id: number, patientUserId: number): Promise<void> {
    const patientId = await this.getPatientProfileId(patientUserId);
    const request = await AppointmentRequestModel.findOne({
      where: { id, patientId },
    });

    if (!request) throw new NotFound();
    if (request.status === "approved") {
      throw new Conflict(
        "Esta solicitação já gerou uma consulta confirmada. Use a opção de cancelar a consulta.",
      );
    }

    const transaction = await db.transaction();
    try {
      const pendingMatch = await AppointmentMatchModel.findOne({
        where: {
          requestId: id,
          status: {
            [Op.in]: ["queued", "waiting_response"] satisfies AppointmentMatchStatus[],
          },
        },
        transaction,
      });

      if (pendingMatch) {
        await pendingMatch.update(
          { status: "rejected", respondedAt: new Date() },
          { transaction },
        );
      }

      await request.update({ status: "cancelled" }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

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

  /** Lista os alertas/ofertas do paciente autenticado. */
  async listPatientMatches(
    patientUserId: number,
    status?: AppointmentMatchStatus,
    includeHistory = false,
  ): Promise<IAppointmentMatch[]> {
    const where: WhereOptions<IAppointmentMatch> = {};

    if (status) {
      where.status = status;
    } else if (!includeHistory) {
      where.status = "waiting_response";
    }

    const patientId = await this.getPatientProfileId(patientUserId);
    const matches = await AppointmentMatchModel.findAll({
      where,
      include: this.patientMatchIncludes(patientId, true),
      order: [["expiresAt", "ASC"], ["createdAt", "DESC"]],
    });

    return matches.map((match) => match.get({ plain: true }));
  }

  private patientMatchIncludes(patientId?: number, required = false): any[] {
    return [
      {
        model: AppointmentModel,
        include: [
          SpecialityModel,
          {
            model: DoctorModel,
            attributes: ["userId", "crm", "enabled"],
            include: [
              {
                model: UserModel,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      },
      {
        model: AppointmentRequestModel,
        required,
        ...(patientId ? { where: { patientId } } : {}),
      },
    ];
  }

  /** Busca um match sem filtro de proprietário, apenas para rotinas internas. */
  async getMatch(matchId: number): Promise<IAppointmentMatch> {
    const match = await AppointmentMatchModel.findByPk(matchId, {
      include: this.patientMatchIncludes(),
    });

    if (!match) throw new NotFound();
    return match.get({ plain: true });
  }

  /**
   * Busca um match exigindo que a solicitação pertença ao usuário autenticado.
   * Retorna 404 também para match alheio, evitando revelar sua existência.
   */
  async getPatientMatch(
    matchId: number,
    patientUserId: number,
    transaction?: Transaction,
  ): Promise<IAppointmentMatch> {
    const patientId = await this.getPatientProfileId(
      patientUserId,
      transaction,
    );

    const match = await AppointmentMatchModel.findOne({
      where: { id: matchId },
      include: this.patientMatchIncludes(patientId, true),
      transaction,
    });

    if (!match) throw new NotFound();
    return match.get({ plain: true });
  }

  async confirmMatch(matchId: number, patientUserId: number): Promise<void> {
    const transaction = await db.transaction();

    try {
      const match = await this.getPatientMatch(matchId, patientUserId, transaction);
      const now = new Date();

      if (match.appointment?.status !== "open") {
        throw new Conflict("A vaga não está mais disponível.");
      }
      if (match.request?.status !== "waiting") {
        throw new Conflict("A solicitação não está mais aguardando atendimento.");
      }
      if (match.status !== "waiting_response") {
        throw new Conflict("Esta oferta não está aguardando resposta.");
      }
      if (match.expiresAt && new Date(match.expiresAt) <= now) {
        await AppointmentMatchModel.update(
          { status: "expired" },
          { where: { id: match.id }, transaction },
        );
        throw new Conflict("A oferta expirou e não pode mais ser aceita.");
      }

      await AppointmentMatchModel.update(
        { status: "accepted", respondedAt: now },
        { where: { id: match.id }, transaction },
      );
      await AppointmentModel.update(
        { status: "booked" },
        { where: { id: match.appointmentId }, transaction },
      );
      await AppointmentMatchModel.update(
        { status: "cancelled" },
        {
          where: {
            appointmentId: match.appointmentId,
            id: { [Op.ne]: match.id },
            status: {
              [Op.in]: ["queued", "waiting_response"] satisfies AppointmentMatchStatus[],
            },
          },
          transaction,
        },
      );
      await AppointmentRequestModel.update(
        { status: "approved" },
        { where: { id: match.requestId }, transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cancela um match aceito, após validar que ele pertence ao paciente conectado.
   */
  async cancelMatch(matchId: number, patientUserId: number): Promise<void> {
    const transaction = await db.transaction();

    try {
      const match = await this.getPatientMatch(matchId, patientUserId, transaction);

      if (match.status !== "accepted") {
        throw new Conflict("Somente ofertas aceitas podem ser canceladas.");
      }

      const now = Date.now();
      const acceptedAt = new Date(match.respondedAt ?? match.updatedAt).getTime();
      const appointmentDate = new Date(match.appointment!.date).getTime();
      const timeSinceAccepted = now - acceptedAt;
      const timeUntilAppointment = appointmentDate - now;

      if (timeUntilAppointment < 0) {
        throw new Conflict("Não é possível cancelar uma consulta já realizada.");
      }

      const isTooClose = timeUntilAppointment < 24 * HOUR;
      const undoWindowExpired = timeSinceAccepted > 15 * MINUTE;
      if (isTooClose && undoWindowExpired) {
        throw new Conflict(
          "Faltam menos de 24 horas para a consulta e o prazo de 15 minutos para desfazer expirou.",
        );
      }

      await AppointmentMatchModel.update(
        { status: "cancelled" },
        { where: { id: match.id }, transaction },
      );
      await AppointmentModel.update(
        { status: "open" },
        { where: { id: match.appointmentId }, transaction },
      );
      await AppointmentRequestModel.update(
        { status: "waiting" },
        { where: { id: match.requestId }, transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /** Recusa a oferta e aplica cooldown dentro da mesma transação. */
  async rejectMatch(matchId: number, patientUserId: number): Promise<void> {
    const transaction = await db.transaction();

    try {
      const match = await this.getPatientMatch(matchId, patientUserId, transaction);
      if (match.status !== "waiting_response" && match.status !== "queued") {
        throw new Conflict(
          `A oferta não pode ser recusada no status atual (${match.status}).`,
        );
      }

      const request = match.request!;
      const newAttempts = (request.attempts ?? 0) + 1;
      const backoffMinutes =
        this.config.APPOINTMENT_REQUEST_BACKOFF_MINUTES *
        Math.pow(
          this.config.APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER,
          newAttempts - 1,
        );
      const cooldownUntil = new Date(Date.now() + backoffMinutes * MINUTE);

      await AppointmentMatchModel.update(
        { status: "rejected", respondedAt: new Date() },
        { where: { id: match.id }, transaction },
      );
      await AppointmentRequestModel.update(
        { attempts: newAttempts, cooldownUntil },
        { where: { id: match.requestId }, transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

