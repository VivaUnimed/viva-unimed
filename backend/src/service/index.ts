import { AuthService } from "./auth.service";
import { UserService } from "./user.service";

export default {
  user: new UserService(),
  auth: new AuthService(),
}
