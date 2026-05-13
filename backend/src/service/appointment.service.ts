

import { IAppointment, IAppointmentCreate, AppointmentStatus, IAppointmentMatchCreate, AppointmentRequestStatus, IAppointmentRequest, AppointmentMatchStatus } from "shared";
import AppointmentModel from "../db/models/appointment.model";
import { NotFound } from "../error";
import AppointmentMatchModel from "../db/models/appointment_match.model";
import { Op } from "sequelize";

export class AppointmentService {
  /** Cria um novo agendamento */
  async create(data: Omit<IAppointmentCreate, 'status'>): Promise<IAppointment> {
    // TODO: verificar se médico possui a especialidade antes de criar
    const model = await AppointmentModel.create({
      ...data,
      status: 'open',
    });
    return model.get({ plain: true });
  }

  async addMatch(data: IAppointmentMatchCreate) {
    const found = await AppointmentMatchModel.findOne({
      where: {
        appointmentId: data.appointmentId,
        requestId: data.requestId,
      }
    });
    if(found) {
      throw new Error(`match already exists for appointment ${data.appointmentId} and request ${data.requestId}`);
    }
    const model = await AppointmentMatchModel.create(data);
    return model.get({ plain: true });
  }

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

  /** Busca agendamento por ID */
  async getById(id: number): Promise<IAppointment> {
    const model = await AppointmentModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  /** Lista todos os agendamentos */
  async list(): Promise<IAppointment[]> {
    const list = await AppointmentModel.findAll();
    return list.map((model) => model.get({ plain: true }));
  }

  async listOpen(): Promise<IAppointment[]> {
    const status: AppointmentStatus = "open";
    const list = await AppointmentModel.findAll({
      where: {
        status,
      },
    })
    return list.map(v => v.get({ plain: true }));
  }

  /** Atualiza um agendamento existente */
  async update(id: number, data: Partial<IAppointmentCreate>): Promise<IAppointment> {
    const model = await AppointmentModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.update(data);
    return model.get({ plain: true });
  }

  async reserved(appointmentId: number): Promise<void> {
    const appointment = await this.getById(appointmentId);
    if (!appointment) {
      throw new NotFound();
    }
    await this.update(appointmentId, { status: 'booked' });
  }

  /** Remove um agendamento */
  async delete(id: number): Promise<void> {
    // O Que fazer se ao deletar uma vaga? matches? e se já está confirmada?
    // Notificar paciente caso já tenha sido confirmada? ou só permitir deletar vagas não confirmadas?
    const model = await AppointmentModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}
