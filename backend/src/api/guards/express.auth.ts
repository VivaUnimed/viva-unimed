import { Request } from "express";
import { Guard } from "./security";
import { Unauthorized } from "../../error";

export async function expressAuthentication(request: Request, guard: Guard, scopes?: string[]): Promise<any> {
  const user = request.user;
  if(!user) {
    throw new Unauthorized();
  }
  return user;
}
