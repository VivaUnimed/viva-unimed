import { ApiError } from "./ApiError";

export class NotFound extends ApiError {
  status = 404;
}
