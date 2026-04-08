import { IUser } from "shared";
import UserModel from "../db/models/user.model";
import PasswordModel from "../db/models/password.model";
import { Unauthorized } from "../error";
import { comparePassword } from "../helpers/password";

export class AuthService {
  constructor() {}

  async authenticate(email: string, password: string): Promise<IUser> {
    const user = await UserModel.findOne({
      where: { email },
    });
    if(!user) {
      throw new Unauthorized();
    }
    const storedPassword = await PasswordModel.findByPk(user.id);
    if(!storedPassword) {
      throw new Unauthorized();
    }
    const match = await comparePassword(password, {
      hash: storedPassword.hash,
      salt: storedPassword.salt,
    });
    if(!match) {
      throw new Unauthorized();
    }
    return user.get({ plain: true });
  }
}
