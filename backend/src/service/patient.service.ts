import { IPatient, IPatientCreate } from "shared";
import PatientModel from "../db/models/patient.model";
import { NotFound } from "../error";

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
    const model = await PatientModel.findOne({ where: { userId } });
    if (!model) return null;
    return model.get({ plain: true });
  }

  /** Lista todos os pacientes */
  async list(): Promise<IPatient[]> {
    const list = await PatientModel.findAll();
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
