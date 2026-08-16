import { IUser, IUserCreate, IUserListParams, IUserUpdate, Role } from "shared";
import UserModel from "../db/models/user.model";
import { Op, Transaction, WhereOptions } from "sequelize";
import PasswordModel from "../db/models/password.model";
import { hashPassword } from "../helpers/password";
import RoleModel from "../db/models/role.model";
import { getPermissionsFromRoles } from "../entities";
import { Conflict } from "../error";

export class UserService {
  private normalizeUserPayload(user: Partial<IUserCreate | IUserUpdate>) {
    return {
      name: typeof user.name === "string" ? user.name.trim() : undefined,
      email: typeof user.email === "string" ? user.email.trim() : undefined,
      cpf: typeof user.cpf === "string" ? user.cpf.trim() || undefined : undefined,
      phone: user.phone !== undefined && user.phone !== null ? String(user.phone) : undefined,
    };
  }

  private async assertUniqueFields(
    user: Partial<Pick<IUser, "email" | "cpf">>,
    options?: { excludeUserId?: number, transaction?: Transaction },
  ): Promise<void> {
    const or: Array<Record<string, unknown>> = [];

    if (user.email) {
      or.push({ email: user.email });
    }

    if (user.cpf) {
      or.push({ cpf: user.cpf });
    }

    if (!or.length) {
      return;
    }

    const where: WhereOptions<IUser> = options?.excludeUserId
      ? {
        [Op.and]: [
          { [Op.or]: or } as WhereOptions<IUser>,
          { id: { [Op.ne]: options.excludeUserId } } as WhereOptions<IUser>,
        ],
      }
      : {
        [Op.or]: or,
      };

    const existingUser = await UserModel.findOne({
      where,
      transaction: options?.transaction,
    });

    if (!existingUser) {
      return;
    }

    if (user.email && existingUser.email === user.email) {
      throw new Conflict("Já existe um usuário com este e-mail.");
    }

    if (user.cpf && existingUser.cpf === user.cpf) {
      throw new Conflict("Já existe um usuário com este CPF.");
    }

    throw new Conflict("Já existe um usuário com os dados informados.");
  }

  /** Cria um usuário, salva sua senha (hasheada) e atribui cargos iniciais */
  async create(user: IUserCreate, options?: { transaction?: Transaction }): Promise<IUser> {
    const normalizedUser = this.normalizeUserPayload(user);
    await this.assertUniqueFields(normalizedUser, options);

    const res = await UserModel.create({
      name: normalizedUser.name as string,
      email: normalizedUser.email as string,
      cpf: normalizedUser.cpf,
      phone: normalizedUser.phone,
    }, {
      transaction: options?.transaction,
    });

    if(user.password) {
      const { hash, salt } = await hashPassword(user.password);
      await PasswordModel.create({
        userId: res.id,
        hash,
        salt,
      }, {
        transaction: options?.transaction,
      });
    }

    if(user.roles?.length) {
      await RoleModel.bulkCreate(user.roles.map(role => ({
        role,
        userId: res.id,
      })), {
        transaction: options?.transaction,
      });
    }

    return res.get({ plain: true });
  }

  /** Atribui um novo cargo ao usuário, evitando duplicidade */
  async addUserRole(userId: number, role: Role, options?: { transaction?: Transaction }): Promise<void> {
    const exists = await RoleModel.findOne({
      where: { userId, role },
      transaction: options?.transaction,
    });
    if (exists) return;

    await RoleModel.create({
      role,
      userId,
    }, {
      transaction: options?.transaction,
    });
  }

  /** Remove um cargo específico associado ao usuário */
  async removeUserRole(userId: number, role: Role, options?: { transaction?: Transaction }): Promise<void> {
    await RoleModel.destroy({
      where: { userId, role },
      transaction: options?.transaction,
    });
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
  async getById(id: number, options?: { transaction?: Transaction }): Promise<IUser | null> {
    const res = await UserModel.findByPk(id, {
      include: [RoleModel],
      transaction: options?.transaction,
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
  async update(id: number, user: Partial<IUserUpdate>, options?: { transaction?: Transaction }): Promise<IUser | null> {
    const res = await UserModel.findByPk(id, {
      transaction: options?.transaction,
    });
    if (!res) return null;

    const normalizedUser = this.normalizeUserPayload(user);
    await this.assertUniqueFields(normalizedUser, {
      excludeUserId: id,
      transaction: options?.transaction,
    });

    const payload = Object.fromEntries(
      Object.entries(normalizedUser).filter(([, value]) => value !== undefined),
    );

    await res.update(payload, {
      transaction: options?.transaction,
    });

    return this.getById(id, options);
  }

  /** Remove o registro do usuário do banco de dados */
  async delete(id: number, options?: { transaction?: Transaction, force?: boolean }): Promise<boolean> {
    const res = await UserModel.findByPk(id, {
      transaction: options?.transaction,
    });
    if (!res) return false;

    await PasswordModel.destroy({
      where: { userId: id },
      transaction: options?.transaction,
    });

    await RoleModel.destroy({
      where: { userId: id },
      transaction: options?.transaction,
    });

    await res.destroy({
      transaction: options?.transaction,
      force: options?.force,
    });

    return true;
  }

  async assertAdminUser(email: string, password: string) {
    const admin = await UserModel.findOne({
      where: {
        email: email,
      }
    })
    if(admin) return;
    console.log(`CREATING ADMIN USER WITH ${email}`);
    await this.create({
      email,
      password,
      name: 'admin',
      roles: ['Admin'],
    });
  }
}
