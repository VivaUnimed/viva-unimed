import { Permission, Role } from "./permissions";

/** Telefone pode chegar como string (cliente) ou número (admin legado). */
export type PhoneValue = string | number;

export interface IUserCreate {
  name: string;
  email: string;
  cpf?: string;
  phone?: PhoneValue;
  password?: string;
  roles?: Role[];
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: PhoneValue;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  phone?: PhoneValue;
  roles?: Role[];
  permissions?: Permission[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  active?: boolean;
}

export interface IUserListParams {
  nameLike?: string;
  emailLike?: string;
}
