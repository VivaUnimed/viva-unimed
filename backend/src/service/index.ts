import { AuthService } from "./auth.service";
import { SpecialityService } from "./speciality.service";
import { UserService } from "./user.service";
import { DoctorService } from "./doctor.service";
import { PatientService } from "./patient.service";
import { AppointmentRequestService } from "./appointment_request.service";
import { AppointmentService } from "./appointment.service";
import { IConfig } from "../config";

class AppServices {
  user: UserService;
  auth: AuthService;
  speciality: SpecialityService;
  doctor: DoctorService;
  patient: PatientService;
  request: AppointmentRequestService;
  appointment: AppointmentService;

  init(config: IConfig) {
    this.user = new UserService();
    this.auth = new AuthService(config);
    this.speciality = new SpecialityService();
    this.doctor = new DoctorService();
    this.patient = new PatientService();
    this.request = new AppointmentRequestService(config);
    this.appointment = new AppointmentService(config);
  }
}

export default new AppServices();