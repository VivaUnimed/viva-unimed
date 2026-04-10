import { Security as SecurityBase } from '@tsoa/runtime';
import { Permission } from 'shared';

export enum Guard {
  JWT = "JWT",
}

export function Security(name: Guard, requires?: Permission[]): ReturnType<typeof SecurityBase> {
  return SecurityBase(name, requires);
}
