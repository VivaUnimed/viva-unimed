import { IUser, IUserListParams, IUserUpdate, Role, StaffCreateRequest } from "shared";
import UserModel from "../db/models/user.model";
import { Op, WhereOptions } from "sequelize";
import PasswordModel from "../db/models/password.model";
import { hashPassword } from "../helpers/password";
import RoleModel from "../db/models/role.model";
import { getPermissionsFromRoles } from "../entities";
import { BadRequest } from "../error";
import { db } from "../db";

export class UserService {
    /** Cria um usuário, salva sua senha (hasheada) e atribui cargos iniciais */
  async createStaff(data: StaffCreateRequest): Promise<IUser> {
    if (data.role !== 'Admin' && data.role !== 'Tecnico') {
      throw new BadRequest("Utilize a rota /api/patient para cadastrar pacientes.");
    }
    const t = await db.transaction();

    try {
      // cria o registro na tabela base
      const newUser = await UserModel.create({
        name: data.name,
        email: data.email,
        // cpf: data.cpf,
        phone: data.phone,
      }, { transaction: t });

      // atribui a role administrativa
      await RoleModel.create({
        userId: newUser.id,
        role: data.role
      }, { transaction: t });

      if (data.password) {
        const { hash, salt } = await hashPassword(data.password);

        await PasswordModel.create({
          userId: newUser.id,
          hash,
          salt,
        }, { transaction: t });
      }

      await t.commit();

      // retorna o usuário recém-criado
      return this.getById(newUser.id);

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }


  /** Atribui um novo cargo ao usuário, evitando duplicidade */
  async addUserRole(userId: number, role: Role): Promise<void> {
    if (role === 'Paciente') {
      throw new BadRequest("Não é possível atribuir o perfil de Paciente por aqui. Um paciente precisa ter um prontuário criado no sistema.");
    }
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
      include: [RoleModel]
    });

    return res.map(user => {
      const roles = user.roles?.map(r => r.role) || [];

      return {
        ...user.get({ plain: true }),
        roles,
      };
    });
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
  async updateStaffRole(userId: number, newRole: 'Admin' | 'Tecnico'): Promise<void> {
    const t = await db.transaction();

    try {
      // remove apenas os cargos de equipe (protegendo Medico ou Paciente se existirem)
      await RoleModel.destroy({
        where: {
          userId,
          role: {
            [Op.in]: ['Admin', 'Tecnico']
          }
        },
        transaction: t
      });

      // insere o cargo novo escolhido
      await RoleModel.create({
        userId,
        role: newRole
      }, { transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /** Remove o registro do usuário do banco de dados */
  async delete(id: number): Promise<boolean> {
    const res = await UserModel.findByPk(id);
    if (!res) return false;
    await res.destroy();
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
    await this.createStaff({
      email,
      password,
      cpf: '00000000000',
      name: 'admin',
      role: 'Admin',
    });
  }
}
