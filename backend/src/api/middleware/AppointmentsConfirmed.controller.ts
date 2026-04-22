import { Request, Response } from 'express';
import { AppointmentConfirmedService } from '../services/AppointmentConfirmedservice';

const appointmentService = new AppointmentConfirmedService();

export class AppointmentConfirmedController {

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { id_paciente, id_vaga, id_doctor, tipo_vaga } = req.body;

      const appointment = await appointmentService.create({
        id_paciente,
        id_vaga,
        id_doctor,
        tipo_vaga,
      });

      return res.status(201).json(appointment);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar agendamento' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const appointments = await appointmentService.findAll();

      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const appointment = await appointmentService.findById(id);

      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }

      return res.status(200).json(appointment);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar agendamento' });
    }
  }

  async findByPaciente(req: Request, res: Response): Promise<Response> {
    try {
      const { id_paciente } = req.params;

      const appointments = await appointmentService.findByPaciente(id_paciente);

      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar agendamentos do paciente' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { id_paciente, id_vaga, id_doctor, tipo_vaga } = req.body;

      const appointment = await appointmentService.update(id, {
        id_paciente,
        id_vaga,
        id_doctor,
        tipo_vaga,
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }

      return res.status(200).json(appointment);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar agendamento' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = await appointmentService.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Agendamento não encontrado' });
      }

      return res.status(200).json({ message: 'Agendamento removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao remover agendamento' });
    }
  }
}