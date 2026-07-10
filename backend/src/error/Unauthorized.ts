import { ApiError } from "./ApiError";

export class Unauthorized extends ApiError {
  status = 401;
}
