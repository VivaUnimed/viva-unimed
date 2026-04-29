import QueueWaitingModel, {
  IQueueWaiting,
  IQueueWaitingCreate,
} from "..db/models/QueueWaiting.model";

import DoctorAvailabilityModel from "..db/models/DoctorAvailability.model";
import AvailablePositionsModel from "..sb/models/AvailablePositions.model";

class QueueWaitingService {
  async create(data: IQueueWaitingCreate): Promise<QueueWaitingModel> {
    return QueueWaitingModel.create(data);
  }

  async findAll(): Promise<QueueWaitingModel[]> {
    return QueueWaitingModel.findAll({
      include: [DoctorAvailabilityModel, AvailablePositionsModel],
    });
  }

  async findById(id: string): Promise<QueueWaitingModel | null> {
    return QueueWaitingModel.findByPk(id, {
      include: [DoctorAvailabilityModel, AvailablePositionsModel],
    });
  }

  async update(
    id: string,
    data: Partial<IQueueWaiting>
  ): Promise<QueueWaitingModel | null> {
    const record = await QueueWaitingModel.findByPk(id);

    if (!record) return null;

    await record.update(data);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const record = await QueueWaitingModel.findByPk(id);

    if (!record) return false;

    await record.destroy();
    return true;
  }
}

export default new QueueWaitingService();