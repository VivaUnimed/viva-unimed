import { Controller, Route, Get, Path, Tags, Post, Body, Queries, Delete, Request, Put } from "tsoa";
import { NotFound } from "../error";
import type { IUser, IUserCreate, IUserListParams, Role } from "shared";
import service from "../service";
import { Guard, Security } from "./guards";


@Route("/api/user")
@Tags("User")
export class UserController extends Controller {
  @Post("")
  @Security(Guard.JWT, ["user.create"])
  async create(@Body() requestBody: IUserCreate): Promise<IUser> {
    return service.user.create(requestBody);
  }

  /** Adciona permissão a um usuário */
  @Put("/{userId}/roles")
  @Security(Guard.JWT, ["user.edit.role"])
  async addUserRole(@Path() userId: number, @Body() data: { role: Role }): Promise<void> {
    return service.user.addUserRole(userId, data.role);
  }

  /** Remove permissão a um usuário */
  @Delete("/{userId}/roles")
  @Security(Guard.JWT, ["user.edit.role"])
  async removeUserRole(@Path() userId: number, @Body() data: { role: Role }): Promise<void> {
    return service.user.removeUserRole(userId, data.role);
  }

  /**
   * Adciona permissão a um usuário
   * teste `var1` abc
   *
   * - op1
   * - op2
   *
   * __negrito__
   *
  */
  @Get("")
  @Security(Guard.JWT, ["user.read"])
  async list(@Queries() params: IUserListParams): Promise<IUser[]> {
    return service.user.list(params);
  }

  @Get("/me")
  @Security(Guard.JWT)
  async getMe(@Request() req: Express.Request) {
    const user = await service.user.getById(req.user?.userId);
    if(!user) {
      throw new NotFound();
    }
    return user;
  }

  @Get("/{userId}")
  @Security(Guard.JWT, ["user.read"])
  async getById(@Path() userId: number) {
    const user = await service.user.getById(userId);
    if(!user) {
      throw new NotFound();
    }
    return user;
  }
}
