import { Request, Response } from 'express';
import { QueueWaitingService } from '../service/QueueWaiting.service';

const queueWaitingService = new QueueWaitingService();

export class QueueWaitingController {

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { specialty_searched, id_doctor, status } = req.body;

      const queue = await queueWaitingService.create({
        specialty_searched,
        id_doctor,
        status,
      });

      return res.status(201).json(queue);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar fila de espera' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const queues = await queueWaitingService.findAll();
      return res.status(200).json(queues);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar filas' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id_queue } = req.params;

      const queue = await queueWaitingService.findById(id_queue);

      if (!queue) {
        return res.status(404).json({ message: 'Fila não encontrada' });
      }

      return res.status(200).json(queue);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar fila' });
    }
  }

  async findByDoctor(req: Request, res: Response): Promise<Response> {
    try {
      const { id_doctor } = req.params;

      const queues = await queueWaitingService.findByDoctor(id_doctor);

      return res.status(200).json(queues);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar filas do médico' });
    }
  }

  async findBySpecialty(req: Request, res: Response): Promise<Response> {
    try {
      const { specialty_searched } = req.params;

      const queues = await queueWaitingService.findBySpecialty(specialty_searched);

      return res.status(200).json(queues);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar filas por especialidade' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id_queue } = req.params;
      const { specialty_searched, id_doctor, status } = req.body;

      const queue = await queueWaitingService.update(id_queue, {
        specialty_searched,
        id_doctor,
        status,
      });

      if (!queue) {
        return res.status(404).json({ message: 'Fila não encontrada' });
      }

      return res.status(200).json(queue);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar fila' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id_queue } = req.params;
      const { status } = req.body;

      const queue = await queueWaitingService.updateStatus(id_queue, status);

      if (!queue) {
        return res.status(404).json({ message: 'Fila não encontrada' });
      }

      return res.status(200).json(queue);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar status' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id_queue } = req.params;

      const deleted = await queueWaitingService.delete(id_queue);

      if (!deleted) {
        return res.status(404).json({ message: 'Fila não encontrada' });
      }

      return res.status(200).json({ message: 'Fila removida com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao remover fila' });
    }
  }
}