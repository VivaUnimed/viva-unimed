import { Controller, Route, Get, Path, Tags, Post, Body, Queries, Delete, Request, Put } from "tsoa";
import { NotFound } from "../error";
import type { IUser, IUserCreate, IUserListParams, Role } from "shared";
import service from "../service";
import { Guard, Security } from "./guards";


@Route("/api/user")
@Tags("User")
export class UserController extends Controller {
  /** Cria um novo usuário no sistema */
  @Post("")
  @Security(Guard.JWT, ["user.create"])
  async create(@Body() requestBody: IUserCreate): Promise<IUser> {
    return service.user.create(requestBody);
  }

  /** Adiciona uma permissão específica a um usuário existente */
  @Put("/{userId}/roles")
  @Security(Guard.JWT, ["user.edit.role"])
  async addUserRole(@Path() userId: number, @Body() data: { role: Role }): Promise<void> {
    return service.user.addUserRole(userId, data.role);
  }

  /** Remove uma permissão específica de um usuário */
  @Delete("/{userId}/roles")
  @Security(Guard.JWT, ["user.edit.role"])
  async removeUserRole(@Path() userId: number, @Body() data: { role: Role }): Promise<void> {
    return service.user.removeUserRole(userId, data.role);
  }

  /** Lista usuários com base em filtros e parâmetros de busca */
  @Get("")
  @Security(Guard.JWT, ["user.read"])
  async list(@Queries() params: IUserListParams): Promise<IUser[]> {
    return service.user.list(params);
  }

  /** Retorna o perfil e dados do usuário autenticado na sessão */
  @Get("/me")
  @Security(Guard.JWT)
  async getMe(@Request() req: Express.Request) {
    const user = await service.user.getById(req.user?.userId);
    if(!user) {
      throw new NotFound();
    }
    return user;
  }

  /** Busca os detalhes de um usuário específico pelo seu ID */
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
