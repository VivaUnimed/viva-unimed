import { IUser, IUserCreate } from "shared";
import UserModel from "../db/models/user.model";

export class UserService {
  constructor() {

  }

  async create(user: IUserCreate): Promise<IUser> {
    const res = await UserModel.create(user);
    return res.get({ plain: true });
  }

  async list(): Promise<IUser[]> {
    const res = await UserModel.findAll();
    return res.map(r => r.get({ plain: true }));
  }

  async getById(id: number): Promise<IUser | null> {
    const res = await UserModel.findByPk(id);
    if (!res) return null;
    return res.get({ plain: true });
  }

  async update(id: number, user: Partial<IUserCreate>): Promise<IUser | null> {
    const res = await UserModel.findByPk(id);
    if (!res) return null;
    await res.update(user);
    return res.get({ plain: true });
  }

  async delete(id: number): Promise<boolean> {
    const res = await UserModel.findByPk(id);
    if (!res) return false;
    await res.destroy();
    return true;
  }
}
