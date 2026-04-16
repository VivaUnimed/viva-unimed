import { Permission, Role } from "shared";

export const ROLES: Record<Role, Permission[]> = {
  Admin: [
    "user.create", "user.read", "user.edit", "user.edit.role",
    "schedule.aprove", "schedule.request",
    "speciality.read", "speciality.create", "speciality.edit", "speciality.delete",
  ],
  Tecnico: [
    "schedule.aprove",
    "user.read",
    "speciality.read", "speciality.create", "speciality.edit",
  ],
  Paciente: [
    "schedule.request",
    "speciality.read",
  ],
} as const;

export function getPermissionsFromRoles(roles: Role[] | undefined): Permission[] {
  if(!roles) return [];
  const all = roles.map(r => ROLES[r]).flat();
  return Array.from(new Set(all));
}
