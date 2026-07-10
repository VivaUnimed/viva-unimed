

import { Request, Response, NextFunction } from "express";
import service from "../../service";

/**
 * Extrai dados do token JWT e adiciona ao objeto de requisição. O token deve ser enviado no header "Authorization" no formato "Bearer <token>".
 */
export function JwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.get("Authorization") || req.cookies["X-VIVA-TOKEN"];
  const [header, token] = authorization?.split(" ") || [];
  if(header === "Bearer" && token) {
    try {
      const decoded = service.auth.verifyToken(token);
      req.user = decoded;
    } catch (error) {
    }
  } else {

  }
  next();
}
