import { Request, Response } from 'express';
import { AvailablePositionService } from '../services/AvailablePositionService';

const availablePositionService = new AvailablePositionService();

export class AvailablePositionController {

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { id_doctor, queue_id, data_time_vacancy, status_vacancy } = req.body;

      const vacancy = await availablePositionService.create({
        id_doctor,
        queue_id,
        data_time_vacancy,
        status_vacancy,
      });

      return res.status(201).json(vacancy);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar vaga disponível' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const vacancies = await availablePositionService.findAll();
      return res.status(200).json(vacancies);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar vagas' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id_vaga } = req.params;

      const vacancy = await availablePositionService.findById(id_vaga);

      if (!vacancy) {
        return res.status(404).json({ message: 'Vaga não encontrada' });
      }

      return res.status(200).json(vacancy);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar vaga' });
    }
  }

  async findByDoctor(req: Request, res: Response): Promise<Response> {
    try {
      const { id_doctor } = req.params;

      const vacancies = await availablePositionService.findByDoctor(id_doctor);

      return res.status(200).json(vacancies);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar vagas do médico' });
    }
  }

  async findByQueue(req: Request, res: Response): Promise<Response> {
    try {
      const { queue_id } = req.params;

      const vacancies = await availablePositionService.findByQueue(queue_id);

      return res.status(200).json(vacancies);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar vagas da fila' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id_vaga } = req.params;
      const { id_doctor, queue_id, data_time_vacancy, status_vacancy } = req.body;

      const vacancy = await availablePositionService.update(id_vaga, {
        id_doctor,
        queue_id,
        data_time_vacancy,
        status_vacancy,
      });

      if (!vacancy) {
        return res.status(404).json({ message: 'Vaga não encontrada' });
      }

      return res.status(200).json(vacancy);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar vaga' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id_vaga } = req.params;
      const { status_vacancy } = req.body;

      const vacancy = await availablePositionService.updateStatus(
        id_vaga,
        status_vacancy
      );

      if (!vacancy) {
        return res.status(404).json({ message: 'Vaga não encontrada' });
      }

      return res.status(200).json(vacancy);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar status da vaga' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id_vaga } = req.params;

      const deleted = await availablePositionService.delete(id_vaga);

      if (!deleted) {
        return res.status(404).json({ message: 'Vaga não encontrada' });
      }

      return res.status(200).json({ message: 'Vaga removida com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao remover vaga' });
    }
  }
}

