import { Controller, Route, Get, Path, Tags, Post, Body, Queries } from "tsoa";
import { NotFound } from "../error";
import type { IAuthenticationRequest, IUser, IUserCreate, IUserListParams } from "shared";
import service from "../service";

/**
 * Controlador de autenticação.
 * Responsável por login e logout, gerando e removendo o cookie JWT.
 */
@Route("/api/auth")
@Tags("Auth")
export class AuthController extends Controller {
  /**
   * Autentica o usuário com email e senha.
   * Se a autenticação for bem-sucedida, gera um token JWT
   * e define o cookie de sessão.
   */
  @Post("/login")
  async login(@Body() body: IAuthenticationRequest): Promise<IUser & { token: string }> {
    const user = await service.auth.authenticate(body.email, body.password);
    const token = service.auth.createToken(user);
    this.setHeader('Set-Cookie', `X-VIVA-TOKEN=Bearer ${token}; Path=/; HttpOnly; SameSite=Lax`);
    return {
      ...user,
      token,
    };
  }

  /**
   * Finaliza a sessão do usuário removendo o cookie JWT.
   */
  @Get("/logout")
  async logout() {
    this.setHeader('Set-Cookie', `X-VIVA-TOKEN=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  }
}
