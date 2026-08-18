import { IDoctor } from "./doctor";
import { ISpeciality } from "./speciality";
import { IPatient } from "./patient";
import { IPaginate } from "./paginate";

export type AppointmentRequestStatus =
  | "waiting"
  | "approved"
  | "cancelled";

/** Payload administrativo: o Admin escolhe explicitamente o paciente. */
export interface IAppointmentRequestCreate {
  patientId: number;
  specialityId: number;
  doctorId?: number | null;
  status: AppointmentRequestStatus;
  date: Date;
  attempts?: number;
  cooldownUntil?: Date | null;
}

/** Payload do próprio paciente: identidade/status são definidos no backend. */
export interface IAppointmentRequestPatientCreate {
  specialityId: number;
  doctorId?: number | null;
  date: Date;
}

export interface IAppointmentRequest extends IAppointmentRequestCreate {
  id: number;
  patient?: IPatient;
  speciality?: ISpeciality;
  /** Compatibilidade com contrato legado que usava o nome incorreto. */
  specialitie?: ISpeciality;
  doctor?: IDoctor;
  attempts: number;
  cooldownUntil?: Date | null;
  createdAt?: Date;
  /** Compatibilidade com tipos antigos. */
  createAt?: Date;
  updatedAt?: Date;
}

export interface IAppointmentRequestListParams extends IPaginate {
  patientId?: number;
  specialityId?: number;
  doctorId?: number;
  status?: AppointmentRequestStatus;
}

export interface IAppointmentRequestPatientListParams extends IPaginate {
  specialityId?: number;
  doctorId?: number;
  status?: AppointmentRequestStatus;
}
