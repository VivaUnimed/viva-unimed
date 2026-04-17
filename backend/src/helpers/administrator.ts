import { Request } from 'express';

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