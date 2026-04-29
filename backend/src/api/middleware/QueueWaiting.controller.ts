import { Request, Response } from "express";
import QueueWaitingService from "../services/QueueWaiting.service";

class QueueWaitingController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      const result = await QueueWaitingService.create(data);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar registro", error });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const result = await QueueWaitingService.findAll();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar registros", error });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const result = await QueueWaitingService.findById(id);

      if (!result) {
        return res.status(404).json({ message: "Registro não encontrado" });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar registro", error });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await QueueWaitingService.update(id, data);

      if (!result) {
        return res.status(404).json({ message: "Registro não encontrado" });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar registro", error });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = await QueueWaitingService.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Registro não encontrado" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro ao deletar registro", error });
    }
  }
}

export default new QueueWaitingController();