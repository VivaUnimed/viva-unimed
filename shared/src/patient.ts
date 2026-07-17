import { IPaginate } from "./paginate";

export interface IPatientCreate {
  birth: Date;
  userId?: number;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: number;
  password?: string;
}

export interface IPatientUpdate {
  birth?: Date;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: number;
}

export interface IPatient {
  id: number;
  userId: number;
  birth: Date;
  name: string;
  email: string;
  cpf?: string;
  phone?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientRecordCreate {
  birth: Date;
  userId: number;
}

export interface IPatientInternal extends IPatientRecordCreate {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IPatientListParams extends IPaginate {
  search?: string;
}
