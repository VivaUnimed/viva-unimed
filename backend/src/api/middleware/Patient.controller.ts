import { Request, Response } from 'express';

import PatientService from '../service/patient.service';

class PatientController {

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const patient = await PatientService.create(req.body);
      return res.status(201).json(patient);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating patient', error });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const patients = await PatientService.findAll();
      return res.status(200).json(patients);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching patients', error });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      const patient = await PatientService.findById(Number(userId));

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      return res.status(200).json(patient);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching patient', error });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      const result = await PatientService.update(Number(userId), req.body);

      if (result[0] === 0) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      return res.status(200).json({ message: 'Patient updated' });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating patient', error });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      await PatientService.delete(Number(userId));

      return res.status(200).json({ message: 'Patient deleted' });
    } catch (error) {
      return res.status(404).json({ message: 'Patient not found' });
    }
  }
}

export default new PatientController();