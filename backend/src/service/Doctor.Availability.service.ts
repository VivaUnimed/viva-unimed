
import DoctorAvailabilityModel, {
  IDoctorAvailabilityCreate,
} from "../models/Doctor.Availability";

import DoctorModel from "../models/db.doctor.model";
import QueueWaitingModel from "../models/db.Queu.eWaiting";

class DoctorAvailabilityService {
  async create(data: IDoctorAvailabilityCreate) {
    return await DoctorAvailabilityModel.create(data);
  }

  async findAll() {
    return await DoctorAvailabilityModel.findAll({
      include: [
        { model: DoctorModel },
        { model: QueueWaitingModel },
      ],
    });
  }

  async findById(id: string) {
    return await DoctorAvailabilityModel.findByPk(id, {
      include: [
        { model: DoctorModel },
        { model: QueueWaitingModel },
      ],
    });
  }

  async update(id: string, data: Partial<IDoctorAvailabilityCreate>) {
    const availability = await DoctorAvailabilityModel.findByPk(id);

    if (!availability) {
      throw new Error("Disponibilidade não encontrada");
    }

    await availability.update(data);
    return availability;
  }

  async delete(id: string) {
    const availability = await DoctorAvailabilityModel.findByPk(id);

    if (!availability) {
      throw new Error("Disponibilidade não encontrada");
    }

    await availability.destroy();
    return { message: "Deletado com sucesso" };
  }
}

export default new DoctorAvailabilityService();