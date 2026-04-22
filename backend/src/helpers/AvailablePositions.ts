import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface AvailablePositionParams extends ParamsDictionary {
  id_queue: string;
}

export interface CreateAvailablePositionDTO {
  id_doctor: string;
  queue_id: string;
  data_time_vacancy: Date;
  status_vacancy: string;
}

export interface UpdateAvailablePositionDTO {
  id_doctor?: string;
  queue_id?: string;
  data_time_vacancy?: Date;
  status_vacancy?: string;
}

export interface AvailablePositionParams {
  id_vaga: string;
}

export interface DoctorParams {
  id_doctor: string;
}

export interface QueueParams {
  queue_id: string;
}

export interface CreateAvailablePositionRequest extends Request {
  body: CreateAvailablePositionDTO;
}

export interface UpdateAvailablePositionRequest extends Request {
  params: AvailablePositionParams;
  body: UpdateAvailablePositionDTO;
}

export interface AvailablePositionByIdRequest extends Request {
  params: AvailablePositionParams;
}

export interface DoctorParams extends ParamsDictionary {
  id_doctor: string;
}

export interface QueueParams extends ParamsDictionary {  id_queue: string;}

