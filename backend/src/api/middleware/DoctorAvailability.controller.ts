import { Request, Response } from "express";
import DoctorAvailabilityService from "../services/DoctorAvailabilityService";

class DoctorAvailabilityController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const result = await DoctorAvailabilityService.create(data);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const result = await DoctorAvailabilityService.findAll();
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await DoctorAvailabilityService.findById(id);

      if (!result) {
        return res.status(404).json({ message: "Não encontrado" });
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

      const result = await DoctorAvailabilityService.update(id, data);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await DoctorAvailabilityService.delete(id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new DoctorAvailabilityController();