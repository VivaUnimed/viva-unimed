import { IPaginate } from "./paginate";
import { IUser } from "./user";

export interface IPatientCreate {
  birth: Date;
  userId: number;
}

export interface IPatient extends IPatientCreate {
  id: number;
  user?: IUser;
}


export interface IPatientListParams extends IPaginate {
  search?: string;
}
