import { IDoctor } from "./doctor";
import { ISpeciality } from "./speciality";
import { IPatient } from "./patient";
import { IPaginate } from "./paginate";

export type AppointmentRequestStatus =
  | "waiting"
  | "approved"
  | "cancelled";

export interface IAppointmentRequestCreate {
  patientId: number;
  specialityId: number;
  doctorId?: number;
  status: AppointmentRequestStatus;
  date: Date;
  attempts?: number;
  cooldownUntil?: Date;
}

/**
 * Payload aceito nas rotas do próprio paciente.
 * patientId, status, attempts e cooldownUntil são controlados pelo backend.
 */
export interface IAppointmentRequestPatientCreate {
  specialityId: number;
  doctorId?: number;
  date: Date;
}

export interface IAppointmentRequest extends IAppointmentRequestCreate {
  id: number;
  patient: IPatient;
  specialitie: ISpeciality;
  doctor?: IDoctor;
  attempts: number;
  cooldownUntil?: Date;
  createAt: Date;
  updatedAt: Date;
}


export interface IAppointmentRequestListParams extends IPaginate {
  patientId?: number;
  specialityId?: number;
  doctorId?: number;
  status?: AppointmentRequestStatus;
}

/** Filtros permitidos para o próprio paciente. patientId nunca vem do cliente. */
export interface IAppointmentRequestPatientListParams extends IPaginate {
  specialityId?: number;
  doctorId?: number;
  status?: AppointmentRequestStatus;
}
