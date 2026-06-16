import { ApiError } from "./ApiError";

export class Conflict extends ApiError {
  status = 409;
}
