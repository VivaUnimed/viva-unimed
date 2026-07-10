export abstract class ApiError extends Error {
  abstract readonly status: number;
}
