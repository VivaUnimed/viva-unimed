import { Permission, Role } from "./permissions";


export interface IUserCreate {
  name: string;
  email: string;
  cpf?: string;
  // rne?: string; # ou CRNM
  phone?: number;
  password?: string;
  roles?: Role[];
}

export interface IUserUpdate {
  name: string;
  email: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone?: number;
  roles?: Role[];
  permissions?: Permission[];
}

export interface IUserListParams {
  nameLike?: string;
  emailLike?: string;
}
