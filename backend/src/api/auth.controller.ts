import { Controller, Route, Get, Path, Tags, Post, Body, Queries } from "tsoa";
import { NotFound } from "../error";
import type { IAuthenticationRequest, IUser, IUserCreate, IUserListParams } from "shared";
import service from "../service";


@Route("/api/auth")
@Tags("Auth")
export class AuthController extends Controller {
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

  @Get("/logout")
  async logout() {
    this.setHeader('Set-Cookie', `X-VIVA-TOKEN=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  }
}
