import { Permission, Role } from "shared";

export const ROLES: Record<Role, Permission[]> = {
  Admin: [
    "user.create",
    "user.read",
    "user.edit",
    "user.edit.role",
    "schedule.aprove",
    "schedule.request",
  ],
  Tecnico: [
    "schedule.aprove",
    "user.read",
  ],
  Cliente: [
    "schedule.request",
  ],
} as const;

export function getPermissionsFromRoles(roles: Role[] | undefined): Permission[] {
  if(!roles) return [];
  const all = roles.map(r => ROLES[r]).flat();
  return Array.from(new Set(all));
}
