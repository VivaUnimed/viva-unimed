import { IPatient, IPatientCreate, IPatientListParams } from "shared";
import PatientModel from "../db/models/patient.model";
import { NotFound } from "../error";
import UserModel from "../db/models/user.model";
import { paginate } from "./helpers";
import { Op } from "sequelize";

export class PatientService {
  /** Cria um novo registro de paciente associado a um usuário */
  async create(userId: number, data: IPatientCreate): Promise<IPatient> {
    const model = await PatientModel.create({
      ...data,
      userId,
    });
    return model.get({ plain: true });
  }

  /** Atualiza dados do paciente */
  async update(id: number, data: Partial<Omit<IPatientCreate, 'userId'>>): Promise<IPatient> {
    const model = await PatientModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.update(data);
    return model.get({ plain: true });
  }

  /** Busca paciente por ID */
  async getById(id: number): Promise<IPatient> {
    const model = await PatientModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    return model.get({ plain: true });
  }

  /** Busca paciente pelo usuário associado */
  async getByUserId(userId: number): Promise<IPatient | null> {
    const model = await PatientModel.findOne({
      where: { userId },
      include: [UserModel],
    });

    if (!model) return null;
    return model.get({ plain: true });
  }

  /** Lista todos os pacientes */
  async list(params?: IPatientListParams): Promise<IPatient[]> {

    const list = await PatientModel.findAll({
      include: [{
        model: UserModel,
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
    return list.map((model) => model.get({ plain: true }));
  }

  /** Remove um paciente */
  async delete(id: number): Promise<void> {
    const model = await PatientModel.findByPk(id);
    if (!model) {
      throw new NotFound();
    }
    await model.destroy();
  }
}
