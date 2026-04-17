import { Request, Response } from 'express';
import { QueueMemberService } from '../services/QueueMemberService';

const queueMemberService = new QueueMemberService();

export class QueueMemberController {

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { fila_id, patient_id, status } = req.body;

      const member = await queueMemberService.create({
        fila_id,
        patient_id,
        status,
      });

      return res.status(201).json(member);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar membro da fila' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const members = await queueMemberService.findAll();

      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar membros' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const member = await queueMemberService.findById(id);

      if (!member) {
        return res.status(404).json({ message: 'Membro não encontrado' });
      }

      return res.status(200).json(member);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar membro' });
    }
  }

  async findByFila(req: Request, res: Response): Promise<Response> {
    try {
      const { fila_id } = req.params;

      const members = await queueMemberService.findByFila(fila_id);

      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar membros da fila' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const member = await queueMemberService.updateStatus(id, status);

      if (!member) {
        return res.status(404).json({ message: 'Membro não encontrado' });
      }

      return res.status(200).json(member);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar status' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = await queueMemberService.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Membro não encontrado' });
      }

      return res.status(200).json({ message: 'Membro removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao remover membro' });
    }
  }
}