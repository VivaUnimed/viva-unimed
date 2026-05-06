import { IDoctor } from "./doctor";
import { ISpeciality } from "./speciality";
import { IPatient } from "./patient";

export type AppointmentRequestStatus =
  "waiting"
  "approved"
  "cancelled"

export interface IAppointmentRequestCreate {
  patientId: number;
  specialityId: number;
  doctorId?: number;
  status: AppointmentRequestStatus;
  date: Date;
}

export interface IAppointmentRequest extends IAppointmentRequestCreate {
  id: number;
  patient: IPatient;
  specialitie: ISpeciality;
  doctor?: IDoctor;
  createAt: Date;
  updatedAt: Date;
}
