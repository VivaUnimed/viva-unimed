import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface QueueMemberParams extends ParamsDictionary {
  id_queue: string;
}

export type StatusQueueMember =
  | 'ativo'
  | 'inativo'
  | 'aguardando'
  | 'atendido';

export interface CreateQueueMemberDTO {
  fila_id: string;
  patient_id: string;
  status: StatusQueueMember;
}

export interface UpdateStatusDTO {
  status: StatusQueueMember;
}

export interface QueueMemberParams {
  id: string;
}

export interface FilaParams {
  id: string;
}

export interface FilaExtraParams {
  nome: string;
}
export interface CreateQueueMemberRequest extends Request {
  body: CreateQueueMemberDTO;
}

export interface UpdateStatusRequest extends Request {
  params: QueueMemberParams;
  body: UpdateStatusDTO;
}

export interface QueueMemberByIdRequest extends Request {
  params: QueueMemberParams;
}


