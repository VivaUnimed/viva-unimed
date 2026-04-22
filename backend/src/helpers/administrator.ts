import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface AdministratorParams extends ParamsDictionary {
  id_administrator: string;
}
export interface CreateAdministratorDTO {
  user_id: string;
}

export interface AdministratorParams {
  user_id: string;
}

export interface CreateAdministratorRequest extends Request {
  body: CreateAdministratorDTO;
}

export interface AdministratorByIdRequest extends Request {
  params: AdministratorParams;
}