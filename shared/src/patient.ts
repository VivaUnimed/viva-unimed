import { IPaginate } from "./paginate";
import { Permission, Role } from "./permissions";
import { PhoneValue } from "./user";

/**
 * Payload compatível com os dois frontends:
 * - Admin pode informar userId ou criar usuário + paciente no mesmo POST.
 * - Cliente faz autocadastro sem userId.
 */
export interface IPatientCreate {
  birth: Date | string;
  userId?: number;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: PhoneValue;
  password?: string;
}

/** Alias explícito usado no autocadastro do cliente. */
export type IPatientCreateInput = IPatientCreate;

export interface IPatientUpdate {
  birth?: Date | string;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: PhoneValue;
}

/** Atualização do próprio perfil: CPF não é alterável nessa rota. */
export interface IPatientProfileUpdate {
  birth?: Date | string;
  name?: string;
  email?: string;
  phone?: PhoneValue;
}

export interface IPatient {
  id: number;
  userId: number;
  birth: Date;
  name: string;
  email: string;
  cpf?: string;
  phone?: PhoneValue;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientProfile extends IPatient {
  patientId: number;
  roles: Role[];
  permissions: Permission[];
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
