import { QueueMember } from '../db/models/QueueMembers.model';

interface CreateQueueMemberDTO {
  fila_id: string;
  patient_id: string;
  status: 'ativo' | 'inativo' | 'aguardando' | 'atendido';
}

export class QueueMemberService {

  async create(data: CreateQueueMemberDTO): Promise<QueueMember> {
    return await QueueMember.create({
      ...data,
      createdAt: new Date(),
    });
  }

  async findAll(): Promise<QueueMember[]> {
    return await QueueMember.findAll();
  }

  async findById(id: string): Promise<QueueMember | null> {
    return await QueueMember.findByPk(id);
  }

  async findByFila(fila_id: string): Promise<QueueMember[]> {
    return await QueueMember.findAll({
      where: { fila_id },
    });
  }

  async updateStatus(
    id: string,
    status: 'ativo' | 'inativo' | 'aguardando' | 'atendido'
  ): Promise<QueueMember | null> {

    const member = await QueueMember.findByPk(id);

    if (!member) {
      return null;
    }

    await member.update({ status });
    return member;
  }

  async delete(id: string): Promise<boolean> {
    const member = await QueueMember.findByPk(id);

    if (!member) {
      return false;
    }

    await member.destroy();
    return true;
  }
}