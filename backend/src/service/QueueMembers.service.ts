import QueueMemberModel, {IQueueMemberCreate,} from "..db/models/QueueMember.model";

import { QueueWaitingModel } from "..db/models/QueueWaiting.model";
import PatientModel from "..db/models/patient.model";

class QueueMemberService {
  async create(data: IQueueMemberCreate) {
    return await QueueMemberModel.create(data);
  }

  async findAll() {
    return await QueueMemberModel.findAll({
      include: [
        { model: QueueWaitingModel },
        { model: PatientModel },
      ],
    });
  }

  async findById(id: string) {
    return await QueueMemberModel.findByPk(id, {
      include: [
        { model: QueueWaitingModel },
        { model: PatientModel },
      ],
    });
  }

  async update(id: string, data: Partial<IQueueMemberCreate>) {
    const member = await QueueMemberModel.findByPk(id);

    if (!member) {
      throw new Error("Membro da fila não encontrado");
    }

    await member.update(data);
    return member;
  }

  async delete(id: string) {
    const member = await QueueMemberModel.findByPk(id);

    if (!member) {
      throw new Error("Membro da fila não encontrado");
    }

    await member.destroy();
    return { message: "Removido com sucesso" };
  }
}

export default new QueueMemberService();