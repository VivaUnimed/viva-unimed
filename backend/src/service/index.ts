import { AuthService } from "./auth.service";
import { SpecialityService } from "./speciality.service";
import { UserService } from "./user.service";

export default {
  user: new UserService(),
  auth: new AuthService(),
  speciality: new SpecialityService(),
}
