import { IUser, IUserCreate, IUserListParams, IUserUpdate } from "shared";
import UserModel from "../db/models/user.model";
import { Op, WhereOptions } from "sequelize";
import PasswordModel from "../db/models/password.model";
import { hashPassword } from "../helpers/password";

export class UserService {
  constructor() {

  }

  async create(user: IUserCreate): Promise<IUser> {
    const res = await UserModel.create({
      name: user.name,
      email: user.email,
    });
    if(user.password) {
      const { hash, salt } = await hashPassword(user.password);
      await PasswordModel.create({
        userId: res.id,
        hash,
        salt,
      });
    }
    return res.get({ plain: true });
  }

  async list({ nameLike, emailLike }: IUserListParams = { }): Promise<IUser[]> {
    const where: WhereOptions<IUser> = {};
    if (nameLike) {
      where.name = { [Op.iLike] : `%${nameLike}%` };
    }
    if (emailLike) {
      where.email = { [Op.iLike] : `%${emailLike}%` };
    }
    const res = await UserModel.findAll({
      where,
    });
    return res.map(r => r.get({ plain: true }));
  }

  async getById(id: number): Promise<IUser | null> {
    const res = await UserModel.findByPk(id);
    if (!res) return null;
    return res.get({ plain: true });
  }

  async update(id: number, user: Partial<IUserUpdate>): Promise<IUser | null> {
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
