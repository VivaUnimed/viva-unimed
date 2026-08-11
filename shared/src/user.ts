import { Permission, Role } from "./permissions";

export interface IUserBase {
  name: string;
  email: string;
  phone?: string;
}

export interface IUserCreate extends IUserBase {
  cpf?: string; //  corrigir um cpf cadastrado errado, usar um endpoint separado e mais restrito? - com validação extra ou aprovação administrativa.
  password?: string; // TODO: revisar a obrigatoriedade, dependendo do tipo de criação do perfil (admin que criou ou a própria pessoa/paciente?)
  roles?: Role[];
}


export interface StaffCreateRequest extends IUserBase {
  cpf: string;
  password?: string;
  role: 'Admin' | 'Tecnico';
}

export type IUserUpdate = Partial<IUserBase>;

export interface IUser extends IUserBase {
  id: number;
  cpf?: string;
  roles?: Role[];
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
}

export interface IUserListParams {
  nameLike?: string;
  emailLike?: string;
}
