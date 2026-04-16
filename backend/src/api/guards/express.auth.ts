import { Request } from "express";
import { Guard } from "./security";
import { Forbidden, Unauthorized } from "../../error";
import { Permission } from "shared";
import service from "../../service";

/** Integra o TSOA com o Express para validar o JWT e checar se o usuário possui as permissões necessárias */
export async function expressAuthentication(request: Request, guard: Guard, permissions?: Permission[]): Promise<any> {
  const tokenUser = request.user;
  /** Verifica se o middleware de JWT identificou um usuário autenticado na requisição */
  if(!tokenUser) {
    throw new Unauthorized();
  }
  /** Se o endpoint exigir permissões específicas, valida se o usuário possui ao menos uma delas */
  if(permissions?.length) {
    const user = await service.user.getById(tokenUser.userId);
    const userPermissions = new Set(user.permissions);
    // Verifica se alguma das permissões requeridas está presente na lista do usuário
    const hasPermission = permissions.find(required => userPermissions.has(required));
    if(!hasPermission) {
      throw new Forbidden(permissions);
    }
  }
  /** Retorna os dados do usuário contidos no token para uso posterior nos controllers */
  return tokenUser;
}
