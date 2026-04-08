import { Controller, Route, Get, Path, Tags, Post, Body, Queries } from "tsoa";
import { NotFound } from "../error";
import type { IAuthenticationRequest, IUser, IUserCreate, IUserListParams } from "shared";
import service from "../service";


@Route("/api/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("/login")
  async login(@Body() body: IAuthenticationRequest): Promise<IUser> {
    return await service.auth.authenticate(body.email, body.password);
  }
}
