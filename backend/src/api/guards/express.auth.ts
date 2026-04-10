import { Request } from "express";
import { Guard } from "./security";
import { Forbidden, Unauthorized } from "../../error";
import { Permission } from "shared";
import service from "../../service";

export async function expressAuthentication(request: Request, guard: Guard, permissions?: Permission[]): Promise<any> {
  const tokenUser = request.user;
  if(!tokenUser) {
    throw new Unauthorized();
  }
  console.log('CHAMADA API RECEBIDA, PERMISSAO=', permissions);
  if(permissions?.length) {
    const user = await service.user.getById(tokenUser.userId);
    const userPermissions = new Set(user.permissions);
    const hasPermission = permissions.find(required => userPermissions.has(required));
    if(!hasPermission) {
      throw new Forbidden(permissions);
    }
  }
  return tokenUser;
}
