import PatientModel from '../db/models/patient.model';
export interface IPatient {
  userId: number;
  birth: Date;
}

export interface IPatientCreate {
  userId: number;
  birth: Date;
}

export interface IPatientService {
  create(data: IPatientCreate): Promise<PatientModel>;
  findAll(): Promise<PatientModel[]>;
  findById(userId: number): Promise<PatientModel | null>;
  update(userId: number, data: Partial<IPatient>): Promise<[number]>;
}

