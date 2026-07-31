import { IPatient, IPatientListParams, IPatientProfile, IPatientCreateInput, IPatientProfileUpdate } from "shared";
import PatientModel from "../db/models/patient.model";
import { NotFound } from "../error";
import UserModel from "../db/models/user.model";
import RoleModel from "../db/models/role.model";
import { assertUniqueUserIdentity, paginate } from "./helpers";
import { Op } from "sequelize";
import { getPermissionsFromRoles } from "../entities";
import { db } from "../db";
import { hashPassword } from "../helpers/password";
import PasswordModel from "../db/models/password.model";


/**
 * Helper para blindar datas contra mudanças de fuso horário.
 * Força a hora para 12:00:00 UTC, garantindo que shifts de -3h ou +3h
 * não alterem o dia do mês.
 */
const getSafeDate = (dateInput: Date | string): Date => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
};

export class PatientService {
 /**
   * Cria o Usuário e o Paciente em uma única transação (Facade)
   */
  async createPatientComplete(data: IPatientCreateInput): Promise<IPatient> {
    const { normalizedEmail, normalizedCpf } = await assertUniqueUserIdentity(data.email, data.cpf);

    const t = await db.transaction();

    try {
      // cria usuário base
      const newUser = await UserModel.create({
        name: data.name,
        email: normalizedEmail,
        cpf: normalizedCpf,
        phone: data.phone,
      }, { transaction: t });

      // atribui a role de "Paciente" para esse usuário
      await RoleModel.create({
        userId: newUser.id,
        role: 'Paciente'
      }, { transaction: t });

      if (data.password) {
        const { hash, salt } = await hashPassword(data.password);

        await PasswordModel.create({
          userId: newUser.id,
          hash,
          salt,
        }, { transaction: t });
      }

      // cria o perfil do Paciente
      const newPatient = await PatientModel.create({
        userId: newUser.id,
        birth: getSafeDate(data.birth),
      }, { transaction: t });

      // salva no banco
      await t.commit();

      // retorna o paciente
      return this.getById(newPatient.id);

    } catch (error) {
      // se der erro, desfaz tudo
      await t.rollback();
      throw error;
    }
  }

  /** Atualiza dados do paciente (Visão Admin/Técnico) */
  async update(id: number, data: IPatientProfileUpdate): Promise<IPatient> {
    // busca o paciente
    const patient = await PatientModel.findByPk(id);
    if (!patient) throw new NotFound();

    // busca o usuário atrelado a este paciente
    const user = await UserModel.findByPk(patient.userId);
    if (!user) throw new NotFound();

    const t = await db.transaction();

    try {
      // payload apenas para os dados da tabela Users
      const userPayload: Partial<{
        name: string;
        email: string;
        phone: string;
      }> = {};

      if (data.name !== undefined) userPayload.name = data.name;
      if (data.email !== undefined) userPayload.email = data.email;
      if (data.phone !== undefined) userPayload.phone = data.phone;

      // se houver dados de usuário para atualizar, executa na transação
      if (Object.keys(userPayload).length > 0) {
        await user.update(userPayload, { transaction: t });
      }

      // prepara e atualiza os dados da tabela Patients
      if (data.birth !== undefined) {
        await patient.update({ birth: getSafeDate(data.birth) }, { transaction: t });
      }

      // comita a transação se tudo estiver ok
      await t.commit();

      // retorna o paciente atualizado com todos os relacionamentos montados
      return this.getById(id);

    } catch (error) {
      // desfaz tudo se der erro
      await t.rollback();
      throw error;
    }
  }

  /** Busca paciente por ID */
  async getById(id: number): Promise<IPatientProfile> {
    const model = await PatientModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          include: [RoleModel],
        }
      ],
    });
    if (!model) {
      throw new NotFound();
    }
    return PatientService.makePatient(model);
  }

  async getMe(userId: number): Promise<IPatient> {
  const model = await PatientModel.findOne({
    where: { userId },
    include: [
      {
        model: UserModel,
        include: [RoleModel],
      }
    ],
  });
  if (!model) throw new NotFound();
  return PatientService.makePatient(model);
}

// atualiza o próprio perfil

async updateOwnProfile(userId: number, data: IPatientProfileUpdate): Promise<IPatient> {
  const patient = await PatientModel.findOne({ where: { userId } });
  if (!patient) throw new NotFound();

  const user = await UserModel.findByPk(userId);
  if (!user) throw new NotFound();

  const t = await db.transaction();
  try {
    const userPayload: Partial<{
      name: string;
      email: string;
      phone: string;
    }> = {};

    if (data.name !== undefined) userPayload.name = data.name;
    if (data.email !== undefined) userPayload.email = data.email;
    if (data.phone !== undefined) userPayload.phone = data.phone;

    if (Object.keys(userPayload).length > 0) {
      await user.update(userPayload, { transaction: t });
    }

    if (data.birth !== undefined) {
      await patient.update({ birth: getSafeDate(data.birth) }, { transaction: t });
    }

    await t.commit();
    return this.getMe(userId);
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
  /** Lista todos os pacientes */
  async list(params: IPatientListParams = {}): Promise<IPatient[]> {
    const list = await PatientModel.findAll({
      include: [{
        model: UserModel,
        include: [RoleModel],
        where: params.search
          ? {
            [Op.or] : {
              name: { [Op.iLike]: `%${params.search}%` },
              cpf: { [Op.iLike]: `%${params.search}%` },
              email: { [Op.iLike]: `%${params.search}%` },
            }
          }
          : undefined,
      }],
      ...paginate(params),
      order: [['userId', 'DESC']],
    });
    return list.map(PatientService.makePatient);
  }

  /** Remove um paciente */
  async delete(id: number): Promise<void> {
    const model = await PatientModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.destroy();
  }


  static makePatient(model: PatientModel): IPatientProfile {
    const roles = model.user.roles?.map(role => role.role) ?? [];
    return {
      id: model.id,
      patientId: model.id,
      userId: model.userId,
      birth: model.birth,
      email: model.user.email,
      name: model.user.name,
      phone: model.user.phone,
      cpf: model.user.cpf,
      roles,
      permissions: getPermissionsFromRoles(roles),
    }
  }
}
