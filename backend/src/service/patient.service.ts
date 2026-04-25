import PatientModel from '../db/models/patient.model';
import UserModel from '../db/models/user.model';
export interface IPatient {
  userId: number;
  birth: Date;
}

export interface IPatientCreate {
  userId: number;
    birth: Date;
}
class PatientService {

  async create(data: IPatientCreate): Promise<PatientModel> {
    const patient = await PatientModel.create(data);
    return patient;
  }

  async findAll(): Promise<PatientModel[]> {
    return PatientModel.findAll({
      include: [UserModel]
    });
  }

  async findById(userId: number): Promise<PatientModel | null> {
    return PatientModel.findByPk(userId, {
      include: [UserModel]
    });
  }

  async update(userId: number, data: Partial<IPatient>): Promise<[number]> {
    return PatientModel.update(data, {
      where: { userId }
    });
  }

  async delete(userId: number): Promise<void> {
    const patient = await PatientModel.findByPk(userId);

    if (!patient) {
      throw new Error('Patient not found');
    }

    await patient.destroy();
  }
}

export default new PatientService();
