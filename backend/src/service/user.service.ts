import { IUser, IUserCreate, IUserListParams, IUserUpdate, Role } from "shared";
import UserModel from "../db/models/user.model";
import { Op, WhereOptions } from "sequelize";
import PasswordModel from "../db/models/password.model";
import { hashPassword } from "../helpers/password";
import RoleModel from "../db/models/role.model";
import { getPermissionsFromRoles } from "../entities";

export class UserService {
  constructor() {

  }

  /** Cria um usuário, salva sua senha (hasheada) e atribui cargos iniciais */
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
    if(user.roles) {
      await RoleModel.bulkCreate(user.roles.map(role => ({
        role,
        userId: res.id,
      })));
    }
    return res.get({ plain: true });
  }

  /** Atribui um novo cargo ao usuário, evitando duplicidade */
  async addUserRole(userId: number, role: Role): Promise<void> {
    const exists = await RoleModel.findOne({ where: { userId, role }});
    if (exists) return;
    await RoleModel.create({
      role,
      userId,
    });
  }

  /** Remove um cargo específico associado ao usuário */
  async removeUserRole(userId: number, role: Role): Promise<void> {
    await RoleModel.destroy({ where: { userId, role }});
  }

  /** Filtra e lista usuários por nome ou email usando busca parcial (case-insensitive) */
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

  /** Busca usuário por ID, incluindo seus cargos e calculando permissões derivadas */
  async getById(id: number): Promise<IUser | null> {
    const res = await UserModel.findByPk(id, {
      include: [RoleModel]
    });
    if (!res) return null;
    const roles = res.roles?.map(r => r.role);
    return {
      ...res.get({ plain: true }),
      roles,
      permissions: getPermissionsFromRoles(roles),
    };
  }

  /** Atualiza dados básicos do perfil do usuário */
  async update(id: number, user: Partial<IUserUpdate>): Promise<IUser | null> {
    const res = await UserModel.findByPk(id);
    if (!res) return null;
    await res.update(user);
    return res.get({ plain: true });
  }

  /** Remove o registro do usuário do banco de dados */
  async delete(id: number): Promise<boolean> {
    const res = await UserModel.findByPk(id);
    if (!res) return false;
    await res.destroy();
    return true;
  }
}
