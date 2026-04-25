import { QueueWaiting } from '../db/models/QueueWaiting.model';

interface CreateQueueWaitingDTO {
  specialty_searched: string;
  id_doctor: string;
  status?: boolean;
}

export class QueueWaitingService {

  async create(data: CreateQueueWaitingDTO): Promise<QueueWaiting> {
    return await QueueWaiting.create({
      ...data,
      createdAt: new Date(),
    });
  }

  async findAll(): Promise<QueueWaiting[]> {
    return await QueueWaiting.findAll();
  }

  async findById(id_queue: string): Promise<QueueWaiting | null> {
    return await QueueWaiting.findByPk(id_queue);
  }

  async findByDoctor(id_doctor: string): Promise<QueueWaiting[]> {
    return await QueueWaiting.findAll({
      where: { id_doctor },
    });
  }

  async findBySpecialty(specialty_searched: string): Promise<QueueWaiting[]> {
    return await QueueWaiting.findAll({
      where: { specialty_searched },
    });
  }

  async update(
    id_queue: string,
    data: Partial<CreateQueueWaitingDTO>
  ): Promise<QueueWaiting | null> {

    const queue = await QueueWaiting.findByPk(id_queue);

    if (!queue) {
      return null;
    }

    await queue.update(data);
    return queue;
  }

  async updateStatus(
    id_queue: string,
    status: boolean
  ): Promise<QueueWaiting | null> {

    const queue = await QueueWaiting.findByPk(id_queue);

    if (!queue) {
      return null;
    }

    await queue.update({ status });
    return queue;
  }

  async delete(id_queue: string): Promise<boolean> {
    const queue = await QueueWaiting.findByPk(id_queue);

    if (!queue) {
      return false;
    }

    await queue.destroy();
    return true;
  }
}