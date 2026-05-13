import type { AppointmentMatchStatus, AppointmentRequestStatus, IAppointmentMatch, IAppointmentRequest, IAppointmentRequestCreate, IAppointmentRequestListParams } from "shared";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import { Conflict, NotFound } from "../error";
import { Op, WhereOptions } from "sequelize";
import AppointmentModel from "../db/models/appointment.model";
import AppointmentMatchModel from "../db/models/appointment_match.model";
import SpecialityModel from "../db/models/speciality.model";
import PatientModel from "../db/models/patient.model";
import UserModel from "../db/models/user.model";
import { db } from "../db";

/**
 * Serviço responsável pelas operações de pedido de consulta.
 * Gerencia a criação, atualização, consulta e exclusão
 * de `appointment_request` no banco de dados.
 */
export class AppointmentRequestService {
  /**
   * Cria um novo pedido de consulta.
   * Retorna o registro criado em formato plain object.
   */
  async create(data: IAppointmentRequestCreate): Promise<IAppointmentRequest> {
    const found = await AppointmentRequestModel.findOne({
      where: {
        patientId: data.patientId,
        status: 'waiting' satisfies AppointmentRequestStatus,
      }
    })
    if(found) {
      throw new Conflict();
    }
    const model = await AppointmentRequestModel.create(data);
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
   */
  async list({ patientId, specialityId, status, doctorId }: IAppointmentRequestListParams= {}): Promise<IAppointmentRequest[]> {
    const where: WhereOptions<IAppointmentRequest> = { };

    if(patientId) where.patientId = patientId;
    if(specialityId) where.specialityId = specialityId;
    if(status) where.status = status;
    if(doctorId) where.doctorId = doctorId;

    const list = await AppointmentRequestModel.findAll({
      where,
    });
    return list.map((model) => model.get({ plain: true }))
  }

  /**
   * Remove um pedido de consulta pelo ID.
   * Lança NotFound se o registro não existir.
   */
  async delete(id: number): Promise<void> {
    // TODO: e se já foi confirmada? reabrir vaga?
    const model = await AppointmentRequestModel.findByPk(id);
    if(!model) {
      throw new NotFound();
    }
    await model.destroy();
  }

  async getNextByAppointmentId(appointmentId: number): Promise<IAppointmentRequest | undefined> {
    const appointment = await AppointmentModel.findByPk(appointmentId);
    if(appointment.status !== "open") {
      throw new Error("appointment is not open");
    }
    const alreadySent = await AppointmentMatchModel.findAll({
      where: { appointmentId },
      attributes: ['requestId'],
    });
    const request = await AppointmentRequestModel.findOne({
      where: {
        status: "waiting" satisfies AppointmentRequestStatus,
        specialityId: appointment.specialityId,
        doctorId: {
          [Op.or]: [appointment.doctorId, null],
        },
        id: {
          // TODO: melhorar esta query, pode ficar lenta se a lista de já enviados for grande
          [Op.notIn]: alreadySent.map(a => a.requestId),
        },
      },
      order: [['createdAt', 'ASC']],
    });
    return request?.get({ plain: true });
  }

  async listMatchesToNotify(){
    const res = await AppointmentMatchModel.findAll({
      where: {
        status: "queued" satisfies AppointmentMatchStatus,
      },
      include: [
        { model: AppointmentModel, include: [SpecialityModel]},
        {
          model: AppointmentRequestModel,
          include: [
            { model: PatientModel, include: [UserModel] },
          ]
        },
      ]
    });

    return res.map(model => model.get({ plain: true }));
  }

  async updateMatchStatus(matchId: number, status: AppointmentMatchStatus){
    const found = await AppointmentMatchModel.findByPk(matchId);
    if(!found){
      throw new NotFound();
    }
    await found.update({
      status,
    })
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

  async rejectMatch(matchId: number): Promise<void> {
    const match = await this.getMatch(matchId);
    if(match.status === 'accepted') throw new Conflict('match status is accepted');
    if(match.status === 'success') throw new Conflict('match status is success');

    await AppointmentMatchModel.update({ status: 'rejected' }, {
      where: { id: match.id },
    });
  }

  async setExpiredStatus() {
    await AppointmentMatchModel.update({ status: 'expired' }, {
      where: {
        status: {
          [Op.in]: ['waiting_response', 'queued'] satisfies AppointmentMatchStatus[],
        },
        expiresAt: {
          [Op.lte]: new Date(),
        },
      }
    })
  }
}

