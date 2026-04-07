import { Controller, Route, Get, Path, Tags, Post, Body } from "tsoa";
import { NotFound } from "../error";
import type { IUser, IUserCreate } from "shared";
import service from "../service";


@Route("/api/user")
@Tags("User")
export class UserController extends Controller {
  @Post("")
  async create(@Body() requestBody: IUserCreate): Promise<IUser> {
    return service.user.create(requestBody);
  }

  @Get("")
  async list() {
    return service.user.list();
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
