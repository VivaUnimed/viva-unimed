import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface QueueWaitingParams extends ParamsDictionary {
  id: string;
}

export interface CreateQueueWaitingDTO {
  specialty_searched: string;
  id_doctor: string;
  status?: boolean;
}

export interface UpdateQueueWaitingDTO {
  specialty_searched?: string;
  id_doctor?: string;
  status?: boolean;
}

export interface QueueWaitingParams {
  id_queue: string;
}

export interface DoctorParams {
  id_doctor: string;
}

export interface SpecialtyParams {
  specialty_searched: string;
}

export interface CreateQueueWaitingRequest extends Request {
  body: CreateQueueWaitingDTO;
}

export interface UpdateQueueWaitingRequest extends Request {
  params: QueueWaitingParams;
  body: UpdateQueueWaitingDTO;
}

export interface QueueWaitingByIdRequest extends Request {
  params: QueueWaitingParams;
}

export interface DoctorParams {
  id_doctor: string;
}

export interface SpecialtyParams {
  specialty_searched: string;
}