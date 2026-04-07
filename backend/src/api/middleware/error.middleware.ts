import { Request, Response, NextFunction } from "express";
import { ValidateError } from "tsoa";
import { ValidationError } from "joi";
import { NotFound } from "../../error";

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
  console.error("Internal Server Error", error);
  return res.status(500).json({
    message: "Internal Server Error",
  });
}
