import { Permission } from "shared";
import { ApiError } from "./ApiError";

export class Forbidden extends ApiError {
  status = 403;
  constructor(public readonly requires?: Permission[]) {
    super();
  }
}
