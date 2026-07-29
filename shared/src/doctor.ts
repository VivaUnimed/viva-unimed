import { IPaginate } from "./paginate";
import { ISpeciality } from "./speciality";
import { IUser } from "./user";

export type DoctorCreateFacade = {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  password?: string;
  crm: string;
};
export interface IDoctorCreate {
  userId: number;
  crm: string;
  enabled: boolean;
}

export interface IDoctorUpdate {
  crm?: string;
  enabled?: boolean;
}

export interface IDoctor {
  id: number;
  userId: number;
  crm: string;
  enabled: boolean;
  user?: IUser;
  specialities?: ISpeciality[];
}

export interface IDoctorListParams extends IPaginate {
  search?: string;
  specialityId?: number;
}
