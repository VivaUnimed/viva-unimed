import { Request, Response } from 'express';
import { AdministratorService } from '../services/AdministratorService';

const administratorService = new AdministratorService();

export class AdministratorController {

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { user_id } = req.body;

      const admin = await administratorService.create(user_id);

      return res.status(201).json(admin);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar administrador' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const admins = await administratorService.findAll();

      return res.status(200).json(admins);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar administradores' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { user_id } = req.params;

      const admin = await administratorService.findById(user_id);

      if (!admin) {
        return res.status(404).json({ message: 'Administrador não encontrado' });
      }

      return res.status(200).json(admin);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar administrador' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { user_id } = req.params;

      const deleted = await administratorService.delete(user_id);

      if (!deleted) {
        return res.status(404).json({ message: 'Administrador não encontrado' });
      }

      return res.status(200).json({ message: 'Administrador removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao remover administrador' });
    }
  }
}