import { Request } from 'express';

export interface CreateAppointmentDTO {
  id_paciente: string;
  id_vaga: string;
  id_doctor: string;
  tipo_vaga: string;
}

export interface UpdateAppointmentDTO {
  id_paciente?: string;
  id_vaga?: string;
  id_doctor?: string;
  tipo_vaga?: string;
}

export interface AppointmentParams {
  id: string;
}

export interface PacienteParams {
  id_paciente: string;
}

export interface CreateAppointmentRequest extends Request {
  body: CreateAppointmentDTO;
}

export interface UpdateAppointmentRequest extends Request {
  params: AppointmentParams;
  body: UpdateAppointmentDTO;
}

export interface AppointmentByIdRequest extends Request {
  params: AppointmentParams;
}

export interface AppointmentByPacienteRequest extends Request {
  params: PacienteParams;
}
