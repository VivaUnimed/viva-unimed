import { Administrator } from '../db/models/administrator.model';

export class AdministratorService {

  async create(user_id: string): Promise<Administrator> {
    return await Administrator.create({ user_id });
  }

  async findAll(): Promise<Administrator[]> {
    return await Administrator.findAll();
  }

  async findById(user_id: string): Promise<Administrator | null> {
    return await Administrator.findByPk(user_id);
  }

  async delete(user_id: string): Promise<boolean> {
    const admin = await Administrator.findByPk(user_id);

    if (!admin) {
      return false;
    }

    await admin.destroy();
    return true;
  }

  async exists(user_id: string): Promise<boolean> {
    const admin = await Administrator.findByPk(user_id);
    return !!admin;
  }
}