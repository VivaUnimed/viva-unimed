import type { AppointmentRequestStatus, IAppointmentRequest, IAppointmentRequestCreate, IAppointmentRequestListParams } from "shared";
import AppointmentRequestModel from "../db/models/appointment_request.model";
import { Conflict, NotFound } from "../error";
import { Op, WhereOptions } from "sequelize";
import AppointmentModel from "../db/models/appointment.model";
import AppointmentMatchModel from "../db/models/appointment_match.model";

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
      attributes: ['id'],
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
          [Op.notIn]: alreadySent.map(a => a.id),
        },
      },
      order: [['createdAt', 'ASC']],
    });
    return request?.get({ plain: true });
  }
}
