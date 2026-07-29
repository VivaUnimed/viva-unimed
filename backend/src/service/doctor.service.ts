import { DoctorCreateFacade, IDoctor, IDoctorCreate, IDoctorListParams, IDoctorUpdate } from "shared";
import DoctorModel from "../db/models/doctor.model";
import { BadRequest, Conflict, NotFound } from "../error";
import { Op, WhereOptions } from "sequelize";
import UserModel from "../db/models/user.model";
import SpecialityModel from "../db/models/speciality.model";
import RoleModel from "../db/models/role.model";
import { paginate } from "./helpers";
import DoctorSpecialityModel from "../db/models/doctor.speciality.model";
import { getPermissionsFromRoles } from "../entities";
import { hashPassword } from "../helpers/password";
import PasswordModel from "../db/models/password.model";
import { db } from "../db";
/**
 * Serviço responsável pelas operações de médico.
 * Contém validações de unicidade e tratamento de erros
 * para criação, atualização, consulta e remoção.
 */
export class DoctorService {
  /**
   * Cria um médico novo.
   * Verifica se já existe outro médico com o mesmo CRM.
   */
  async createComplete(data: DoctorCreateFacade): Promise<IDoctor> {
    if (data.crm?.length < 4) {
      throw new BadRequest("CRM inválido");
    }

    // FIX: Adicionada validação de unicidade de e-mail antes de abrir a transação
    const userExists = await UserModel.findOne({ where: { email: data.email } });
    if (userExists) {
      throw new Conflict("Já existe um usuário cadastrado com este e-mail.");
    }

    const doctorExists = await DoctorModel.findOne({ where: { crm: data.crm } });
    if (doctorExists) {
      throw new Conflict("O médico com este CRM já está cadastrado no sistema.");
    }

    // FIX: Início da transação no banco de dados para evitar registros órfãos
    const t = await db.transaction();

    try {
      // FIX: 1. Criação do Usuário base na tabela Users
      const newUser = await UserModel.create({
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
      }, { transaction: t });

      // FIX: 2. Atribuição automática da Role 'Medico' na tabela Roles
      await RoleModel.create({
        userId: newUser.id,
        role: 'Medico'
      }, { transaction: t });

      // FIX: 3. Criação da senha na tabela Passwords (se a senha for enviada)
      if (data.password) {
        const { hash, salt } = await hashPassword(data.password);
        await PasswordModel.create({
          userId: newUser.id,
          hash,
          salt,
        }, { transaction: t });
      }

      // FIX: 4. Criação do perfil do médico linkado ao novo usuário criado acima
      const newDoctor = await DoctorModel.create({
        userId: newUser.id,
        crm: data.crm,
        enabled: true,
      }, { transaction: t });

      // FIX: 5. Efetiva a transação
      await t.commit();

      return await this.getById(newDoctor.userId);

    } catch (error) {
      // FIX: Se qualquer etapa acima falhar, desfaz tudo
      await t.rollback();
      throw error;
    }
  }

  /**
   * Atualiza dados de um médico existente.
   * Garante que o CRM não conflite com outro registro.
   */
  async update(id: number, data: IDoctorUpdate): Promise<IDoctor> {
    if (data.crm !== undefined && data.crm.length < 4) {
    throw new BadRequest("crm inválido");
    }

    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }

    if (data.crm !== undefined) {
      const exists = await DoctorModel.findOne({
        where: {
          [Op.or]: [
            { crm: data.crm },
          ],
          userId: { [Op.ne]: id },
        }
      });

      if (exists) {
        throw new Conflict("Existe um outro médico com o mesmo crm");
    }
  }
    await model.update(data);
    return await this.getById(model.userId);
  }

  /**
   * Busca um médico pelo ID.
   * Lança NotFound caso o registro não seja encontrado.
   */
  async getById(id: number): Promise<IDoctor> {
    const model = await DoctorModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          required: true,
          include: [RoleModel],
        },
        SpecialityModel,
      ],
    });
    if (!model) {
      throw new NotFound();
    }
    return DoctorService.makeDoctor(model);
  }

  async addSpeciality(userId: number, specialityId: number) {
    const doctor = await this.getById(userId);
    if(doctor.specialities.find(s => s.id === specialityId)) {
      return;
    }
    await DoctorSpecialityModel.create({
      specialityId,
      userId,
    })
  }

  async removeSpeciality(userId: number, specialityId: number) {
    const doctor = await this.getById(userId);
    if(!doctor.specialities.find(s => s.id === specialityId)) {
      return;
    }
    await DoctorSpecialityModel.destroy({
      where: {
        specialityId,
        userId,
      }
    });
  }

  /**
   * Lista todos os médicos.
   */
  async list(params?: IDoctorListParams): Promise<IDoctor[]> {
    const where: WhereOptions<any> = {};

    if(params?.search) {
      const searchTerm = `%${params.search}%`;
      Object.assign(where, {
        [Op.or]: [
          { crm: { [Op.iLike]: searchTerm } },
          { "$user.name$": { [Op.iLike]: searchTerm } },
          { "$user.email$": { [Op.iLike]: searchTerm } },
        ]
      });
    }

    if(params?.specialityId) {
      const doctorSpeciality = await DoctorSpecialityModel.findAll({
        where: { specialityId: params.specialityId },
        attributes: ["userId"],
      });
      if(!doctorSpeciality.length) {
        return [];
      }
      where.userId = doctorSpeciality.map(ds => ds.userId);
    }

    const list = await DoctorModel.findAll({
      include: [
        {
          model: UserModel,
          required: true,
          include: [RoleModel],
        },
        {
          model: SpecialityModel,
          as: 'specialities',
        }
      ],
      where,
      ...paginate(params),
      order: [["userId", "DESC"]],
    });

    return list.map(DoctorService.makeDoctor);
  }

  static makeDoctor(model: DoctorModel): IDoctor {
    const roles = model.user?.roles?.map(r => r.role) ?? [];

    return {
      id: model.id || model.userId,
      userId: model.userId,
      crm: model.crm,
      enabled: model.enabled,

      // FIX: Refatoração por Composição ao invés de Herança.
      // Antes: As chaves do usuário (name, email) ficavam espalhadas direto no objeto.
      // Agora: Elas ficam organizadas dentro do atributo 'user', resolvendo o conflito de IDs.
      user: model.user ? {
        id: model.user.id,
        name: model.user.name,
        email: model.user.email,
        cpf: model.user.cpf,
        phone: model.user.phone,
        roles,
        permissions: getPermissionsFromRoles(roles),
      } : undefined,

      specialities: model.specialities?.map(s => ({
        id: s.id,
        name: s.name,
      })),
    };
  }

  /**
   * Remove um médico pelo ID.
   * Lança NotFound se o médico não existir.
   */
  async delete(id: number): Promise<void> {
    const model = await DoctorModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}
