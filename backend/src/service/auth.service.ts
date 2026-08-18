import type {
  IMessageResponse,
  IPasswordResetConfirm,
  IUser,
} from "shared";
import UserModel from "../db/models/user.model";
import PasswordModel from "../db/models/password.model";
import { BadRequest, Unauthorized } from "../error";
import { comparePassword, hashPassword } from "../helpers/password";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IConfig } from "../config";

interface ResetTokenEntry {
  token: string;
  expiresAt: number;
}

export class AuthService {
  private tokenSecret?: string;
  private resetTokens = new Map<string, ResetTokenEntry>();

  constructor(private config: IConfig) {
    this.tokenSecret = config.JWT_SECRET;
  }

  async authenticate(email: string, password: string): Promise<IUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) throw new Unauthorized();

    const storedPassword = await PasswordModel.findByPk(user.id);
    if (!storedPassword) throw new Unauthorized();

    const match = await comparePassword(password, {
      hash: storedPassword.hash,
      salt: storedPassword.salt,
    });
    if (!match) throw new Unauthorized();

    return user.get({ plain: true });
  }

  createToken(user: IUser): string {
    if (!this.tokenSecret) throw new Error("Token secret not set");

    return jwt.sign(
      { id: user.id, email: user.email },
      this.tokenSecret,
      { expiresIn: "1h", algorithm: "HS256" },
    );
  }

  verifyToken(token: string): { userId: number; email: string } {
    if (!this.tokenSecret) throw new Error("Token secret not set");

    const decoded = jwt.verify(token, this.tokenSecret, {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "string" || !decoded.id || !decoded.email) {
      throw new Unauthorized();
    }

    return {
      userId: decoded.id as number,
      email: decoded.email as string,
    };
  }

  /**
   * Gera código temporário de recuperação. No ambiente atual o código também
   * é retornado na resposta e registrado no terminal para permitir teste sem
   * depender de um provedor de e-mail.
   */
  async requestPasswordReset(email: string): Promise<IMessageResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ where: { email: normalizedEmail } });

    // Resposta neutra para não revelar quais e-mails estão cadastrados.
    if (!user) {
      return {
        message: "Se o e-mail estiver cadastrado, um código de recuperação será gerado.",
      };
    }

    const token = crypto.randomInt(100000, 1000000).toString();
    const expiresAt =
      Date.now() + this.config.PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES * 60_000;

    this.resetTokens.set(normalizedEmail, { token, expiresAt });
    console.log(`[PASSWORD RESET] ${normalizedEmail} -> código ${token}`);

    return {
      message: "Código de recuperação gerado com sucesso.",
      token,
    };
  }

  async confirmPasswordReset(
    data: IPasswordResetConfirm,
  ): Promise<IMessageResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const reset = this.resetTokens.get(normalizedEmail);

    if (!reset || reset.token !== data.token) {
      throw new BadRequest("Código de recuperação inválido.");
    }

    if (reset.expiresAt <= Date.now()) {
      this.resetTokens.delete(normalizedEmail);
      throw new BadRequest("Código de recuperação expirado.");
    }

    if (!data.password || data.password.length < 6) {
      throw new BadRequest("A nova senha deve possuir pelo menos 6 caracteres.");
    }

    const user = await UserModel.findOne({ where: { email: normalizedEmail } });
    if (!user) throw new BadRequest("Código de recuperação inválido.");

    const { hash, salt } = hashPassword(data.password);
    const password = await PasswordModel.findByPk(user.id);

    if (password) {
      await password.update({ hash, salt });
    } else {
      await PasswordModel.create({ userId: user.id, hash, salt });
    }

    this.resetTokens.delete(normalizedEmail);
    return { message: "Senha redefinida com sucesso." };
  }
}
