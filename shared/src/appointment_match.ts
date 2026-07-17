
import { IAppointment } from "./appointment";
import { IAppointmentRequest } from "./appointment_request";

export type AppointmentMatchStatus =
  | "queued"
  | "waiting_response"
  | "accepted"
  | "rejected"
  | "expired"
  | "success"
  | "cancelled";

export interface IAppointmentMatchCreate {
  appointmentId?: number;
  requestId?: number;
}

export interface IAppointmentMatch extends IAppointmentMatchCreate {
  id: number;
  appointment?: IAppointment;
  request?: IAppointmentRequest;
  createAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}
