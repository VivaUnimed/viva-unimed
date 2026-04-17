import { ISpeciality } from "./speciality";

export interface IDoctorCreate {
  crm: string;
  enabled: boolean;
}

export interface IDoctor extends IDoctorCreate {
  id: number;
  specialities?: ISpeciality[];
}
