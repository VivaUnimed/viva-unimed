import { ApiError } from "./ApiError";

export class BadRequest extends ApiError {
    status = 400;
}
