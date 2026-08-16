import { Body, Controller, Get, Post, Route, Tags } from "tsoa";
import type {
  IAuthenticationRequest,
  IMessageResponse,
  IPasswordResetConfirm,
  IPasswordResetRequest,
  IUser,
} from "shared";
import service from "../service";

@Route("/api/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("/login")
  async login(
    @Body() body: IAuthenticationRequest,
  ): Promise<IUser & { token: string }> {
    const user = await service.auth.authenticate(body.email, body.password);
    const token = service.auth.createToken(user);
    this.setHeader(
      "Set-Cookie",
      `X-VIVA-TOKEN=Bearer ${token}; Path=/; HttpOnly; SameSite=Lax`,
    );
    return { ...user, token };
  }

  @Get("/logout")
  async logout(): Promise<void> {
    this.setHeader(
      "Set-Cookie",
      "X-VIVA-TOKEN=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    );
  }

  @Post("/reset-password-request")
  requestPasswordReset(
    @Body() body: IPasswordResetRequest,
  ): Promise<IMessageResponse> {
    return service.auth.requestPasswordReset(body.email);
  }

  @Post("/reset-password-confirm")
  confirmPasswordReset(
    @Body() body: IPasswordResetConfirm,
  ): Promise<IMessageResponse> {
    return service.auth.confirmPasswordReset(body);
  }
}
