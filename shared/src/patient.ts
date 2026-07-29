import { IPaginate } from "./paginate";
import { Permission, Role } from "./permissions";
import { IUser } from "./user";


export type IPatientCreateInput = {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  birth: string | Date;
  password?: string; //pensar na regra. quando secretaria cria, como a senha é criada/gerada?
  // Regra a definir: no self-cadastro o próprio paciente define a senha.
  // Quando a secretaria cadastra por ele, avaliar gerar senha temporária
  // + fluxo de "primeiro acesso" (definir senha por link enviado por e-mail).
};

export interface IPatientCreate {
  birth: Date;
  userId: number;
}

export interface IPatientInternal extends IPatientCreate {
  user?: IUser;
}

export interface IPatient {
  id: number;
  userId: number;
  birth: Date;
}

export interface IPatientProfile {
  id: number;
  patientId: number;
  userId: number;
  birth: Date;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  roles: Role[];
  permissions: Permission[];
}

export interface IPatientListParams extends IPaginate {
  search?: string;
}

export interface IPatientListParams extends IPaginate {
  search?: string;
}

export type IPatientProfileUpdate = {
  name?: string;
  email?: string;
  phone?: string;
  birth?: Date;
};
