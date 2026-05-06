export interface IPatientCreate {
  birth: Date;
  userId: number;
}

export interface IPatient extends IPatientCreate {
  id: number;
}
