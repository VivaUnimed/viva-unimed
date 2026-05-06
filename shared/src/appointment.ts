import type { IDoctor } from "./doctor";
import type { ISpeciality } from "./speciality";
import type { IUser } from "./user";

export type AppointmentStatus =
  "open"
  "approved"
  "cancelled"
  "no_show";

export interface IAppointmentCreate {
  date: Date;
  doctorId: number;
  specialityId: number;
  createdBy: number;
}

export interface IAppointment extends IAppointmentCreate {
  id: number;
  status: AppointmentStatus;
  doctor?: IDoctor;
  speciality?: ISpeciality;
  user?: IUser;
  createAt: Date;
  updatedAt: Date;
}
