import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import { ValidationError } from "joi";
import { NotFound, Unauthorized, Forbidden } from "../../error";

export function ErrorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
  if(error instanceof ValidateError) {
    console.warn("Validation Failed", error.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: error.fields,
    });
  }
  if(error instanceof ValidationError) {
    return res.status(422).json({
      message: "Validation Failed",
      info: error.message,
      details: error.details,
    });
  }

  if(error instanceof NotFound) {
    return res.status(404).json({
      message: "Not Found",
    });
  }
  if(error instanceof Unauthorized) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if(error instanceof Forbidden) {
    return res.status(403).json({
      message: "Forbidden",
      requires: error.requires,
    });
  }

  console.error("Internal Server Error", error);
  return res.status(500).json({
    message: "Internal Server Error",
  });
}
