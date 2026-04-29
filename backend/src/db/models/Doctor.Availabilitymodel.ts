export interface IDoctorAvailability {
  id: string;
  doctorId: number;
  queueWaitingId: number;
  monthDay: Date;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IDoctorAvailabilityCreate {
  doctorId: number;
  queueWaitingId: number;
  monthDay: Date;
  startTime: string;
  endTime: string;
}

export interface IDoctorAvailabilityUpdate {
  doctorId?: number;
  queueWaitingId?: number;
  monthDay?: Date;
  startTime?: string;
  endTime?: string;
}