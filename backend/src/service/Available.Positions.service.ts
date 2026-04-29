import { AvailablePosition }  from '../db/models/Available.Positions.model';

interface CreateAvailablePositionDTO {
  id_doctor: string;
  queue_id: string;
  data_time_vacancy: Date;
  status_vacancy: string;
}

export class AvailablePositionService {

  async create(data: CreateAvailablePositionDTO): Promise<AvailablePosition> {
    return await AvailablePosition.create(data);
  }

  async findAll(): Promise<AvailablePosition[]> {
    return await AvailablePosition.findAll();
  }

  async findById(id_vaga: string): Promise<AvailablePosition | null> {
    return await AvailablePosition.findByPk(id_vaga);
  }

  async findByDoctor(id_doctor: string): Promise<AvailablePosition[]> {
    return await AvailablePosition.findAll({
      where: { id_doctor },
    });
  }

  async findByQueue(queue_id: string): Promise<AvailablePosition[]> {
    return await AvailablePosition.findAll({
      where: { queue_id },
    });
  }

  async update(
    id_vaga: string,
    data: Partial<CreateAvailablePositionDTO>
  ): Promise<AvailablePosition | null> {

    const vacancy = await AvailablePosition.findByPk(id_vaga);

    if (!vacancy) {
      return null;
    }

    await vacancy.update(data);
    return vacancy;
  }

  async updateStatus(
    id_vaga: string,
    status_vacancy: string
  ): Promise<AvailablePosition | null> {

    const vacancy = await AvailablePosition.findByPk(id_vaga);

    if (!vacancy) {
      return null;
    }

    await vacancy.update({ status_vacancy });
    return vacancy;
  }

  async delete(id_vaga: string): Promise<boolean> {
    const vacancy = await AvailablePosition.findByPk(id_vaga);

    if (!vacancy) {
      return false;
    }

    await vacancy.destroy();
    return true;
  }
}