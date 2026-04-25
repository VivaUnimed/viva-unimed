import { AppointmentConfirmed } from '../db/models/AppointmentsConfirmed.model';

interface CreateAppointmentDTO {
  id_paciente: string;
  id_vaga: string;
  id_doctor: string;
  tipo_vaga: string;
}

export class AppointmentConfirmedService {

  async create(data: CreateAppointmentDTO): Promise<AppointmentConfirmed> {
    return await AppointmentConfirmed.create({
      ...data,
      data_confirmacao: new Date(),
    });
  }

  async findAll(): Promise<AppointmentConfirmed[]> {
    return await AppointmentConfirmed.findAll();
  }

  async findById(id: string): Promise<AppointmentConfirmed | null> {
    return await AppointmentConfirmed.findByPk(id);
  }

  async findByPaciente(id_paciente: string): Promise<AppointmentConfirmed[]> {
    return await AppointmentConfirmed.findAll({
      where: { id_paciente },
    });
  }

  async update(
    id: string,
    data: Partial<CreateAppointmentDTO>
  ): Promise<AppointmentConfirmed | null> {

    const appointment = await AppointmentConfirmed.findByPk(id);

    if (!appointment) {
      return null;
    }

    await appointment.update(data);
    return appointment;
  }

  async delete(id: string): Promise<boolean> {
    const appointment = await AppointmentConfirmed.findByPk(id);

    if (!appointment) {
      return false;
    }

    await appointment.destroy();
    return true;
  }
}