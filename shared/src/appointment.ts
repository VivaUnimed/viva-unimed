import type { IDoctor } from "./doctor";
import type { ISpeciality } from "./speciality";
import type { IUser } from "./user";

export type AppointmentStatus =
  | "open"
  | "booked"
  | "cancelled"
  | "no_show"
  | "expired";

export interface IAppointmentCreate {
  date: Date;
  doctorId: number;
  specialityId: number;
  createdBy: number;
  status: AppointmentStatus;
}

export interface IAppointment extends IAppointmentCreate {
  id: number;
  doctor?: IDoctor;
  speciality?: ISpeciality;
  user?: IUser;
  createAt: Date;
  updatedAt: Date;
}
