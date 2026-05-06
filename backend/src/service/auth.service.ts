import { IUser } from "shared";
import UserModel from "../db/models/user.model";
import PasswordModel from "../db/models/password.model";
import { Unauthorized } from "../error";
import { comparePassword } from "../helpers/password";
import jwt from "jsonwebtoken";

/**
 * Serviço responsável pela autenticação de usuários.
 * Inclui verificação de credenciais, geração de token JWT
 * e validação de token para proteger rotas.
 */
export class AuthService {
  private tokenSecret?: string;

  constructor() {}

  /**
   * Define a chave secreta usada para assinar e validar JWTs.
   */
  setSecret(secret: string) {
    this.tokenSecret = secret;
  }

  /**
   * Autentica um usuário usando email e senha.
   * Verifica se o usuário existe e se a senha confere.
   */
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

  /**
   * Cria um token JWT para o usuário autenticado.
   */
  createToken(user: IUser): string {
    if(!this.tokenSecret) {
      throw new Error("Token secret not set");
    }

    return jwt.sign({
        id: user.id,
        email: user.email
      },
      this.tokenSecret,
      { expiresIn: "1h", algorithm: "HS256" },
    );
  }

  /**
   * Verifica a validade de um token JWT e retorna o payload.
   */
  verifyToken(token: string): { userId: number, email: string } {
    if(!this.tokenSecret) {
      throw new Error("Token secret not set");
    }

    const decoded = jwt.verify(token, this.tokenSecret, { algorithms: ["HS256"] });
    if(typeof decoded === "string" || !decoded.id || !decoded.email) {
      throw new Unauthorized();
    }

    return {
      userId: decoded.id as number,
      email: decoded.email as string,
    }
  }
}
