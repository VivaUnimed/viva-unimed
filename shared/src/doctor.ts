import { IPaginate } from "./paginate";
import { ISpeciality } from "./speciality";
import { IUser } from "./user";

export interface IDoctorCreate {
  userId: number;
  crm: string;
  enabled: boolean;
}

export interface IDoctorInternal extends IDoctorCreate {
  specialities?: ISpeciality[];
}

export interface IDoctor extends IUser {
  crm: string;
  enabled: boolean;
  specialities?: ISpeciality[];
}

export interface IDoctorListParams extends IPaginate {
  search?: string;
  specialityId?: number;
}
