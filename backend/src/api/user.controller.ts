import { Controller, Route, Get, Path, Tags, Post, Body, Queries } from "tsoa";
import { NotFound } from "../error";
import type { IUser, IUserCreate, IUserListParams } from "shared";
import service from "../service";
import { Guard, Security } from "./guards";


@Route("/api/user")
@Tags("User")
@Security(Guard.JWT)
export class UserController extends Controller {
  @Post("")
  async create(@Body() requestBody: IUserCreate): Promise<IUser> {
    return service.user.create(requestBody);
  }

  @Get("")
  async list(@Queries() params: IUserListParams): Promise<IUser[]> {
    return service.user.list(params);
  }

  @Get("/{userId}")
  async getById(@Path() userId: number) {
    const user = await service.user.getById(userId);
    if(!user) {
      throw new NotFound();
    }
    return user;
  }
}
