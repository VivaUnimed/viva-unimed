import { Permission } from "shared";

export class Forbidden extends Error {
  constructor(public readonly requires?: Permission[]) {
    super();
  }
}
