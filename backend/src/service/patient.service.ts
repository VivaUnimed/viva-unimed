import { IPatient, IPatientCreate, IPatientListParams } from "shared";
import PatientModel from "../db/models/patient.model";
import { NotFound } from "../error";
import UserModel from "../db/models/user.model";
import RoleModel from "../db/models/role.model";
import { paginate } from "./helpers";
import { Op } from "sequelize";
import { getPermissionsFromRoles } from "../entities";


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
  /** Cria um novo registro de paciente associado a um usuário */
  async create(userId: number, data: IPatientCreate): Promise<IPatient> {
    const model = await PatientModel.create({
      ...data,
      birth: getSafeDate(data.birth),
      userId,
    });
    return this.getById(model.id);
  }

  /** Atualiza dados do paciente */
  async update(id: number, data: Partial<Omit<IPatientCreate, 'userId'>>): Promise<IPatient> {
    const model = await PatientModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }

    // Intercepta a data se ela vier no payload de atualização
    const payloadToUpdate = { ...data };
    if (payloadToUpdate.birth) {
      payloadToUpdate.birth = getSafeDate(payloadToUpdate.birth); // <-- CORREÇÃO APLICADA AQUI
    }

    await model.update(payloadToUpdate);
    return this.getById(id);
  }

  /** Busca paciente por ID */
  async getById(id: number): Promise<IPatient> {
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

  /** Lista todos os pacientes */
  async list(params?: IPatientListParams): Promise<IPatient[]> {
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

  static makePatient(model: PatientModel): IPatient {
    const roles = model.user.roles?.map(role => role.role) ?? [];
    return {
      id: model.id,
      birth: model.birth,
      email: model.user.email,
      name: model.user.name,
      phone: model.user.phone,
      cpf: model.user.cpf,
      roles,
      permissions: getPermissionsFromRoles(roles),
    };
  }
}
