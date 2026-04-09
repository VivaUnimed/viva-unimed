import { Security as SecurityBase } from '@tsoa/runtime';

export enum Guard {
  JWT = "JWT",
}

export function Security(name: Guard, scopes?: string[]): ReturnType<typeof SecurityBase> {
  return SecurityBase(name, scopes);
}
