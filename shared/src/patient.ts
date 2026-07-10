import { IPaginate } from "./paginate";
import { IUser } from "./user";

export interface IPatientCreate {
  birth: Date;
  userId: number;
}

export interface IPatient extends IUser {
  birth: Date;
}

export interface IPatientInternal extends IPatientCreate {
  user?: IUser;
}


export interface IPatientListParams extends IPaginate {
  search?: string;
}
