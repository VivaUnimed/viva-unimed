import { IPaginate } from "shared";

export function paginate(params?: IPaginate) {
  const size = params?.size || 100;
  const page = params?.page || 0;
  return {
    limit: size,
    offset: page * size,
  };
}
