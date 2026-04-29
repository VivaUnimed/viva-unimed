import { Request, Response } from "express";
import QueueMemberService from "../service/QueueMembers.service";

class QueueMemberController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const result = await QueueMemberService.create(data);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const result = await QueueMemberService.findAll();
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await QueueMemberService.findById(id);

      if (!result) {
        return res.status(404).json({ message: "Membro não encontrado" });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await QueueMemberService.update(id, data);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await QueueMemberService.delete(id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new QueueMemberController();