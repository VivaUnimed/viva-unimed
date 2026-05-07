import { AuthService } from "./auth.service";
import { SpecialityService } from "./speciality.service";
import { UserService } from "./user.service";
import { DoctorService } from "./doctor.service";
import { PatientService } from "./patient.service";
import { AppointmentRequestService } from "./appointment_request.service";
import { AppointmentService } from "./appointment.service";
import { AppointmentMatchService } from "./appointment_match.service";

export default {
  user: new UserService(),
  auth: new AuthService(),
  speciality: new SpecialityService(),
  doctor: new DoctorService(),
  patient: new PatientService(),
  request: new AppointmentRequestService(),
  appointment: new AppointmentService(),
}
