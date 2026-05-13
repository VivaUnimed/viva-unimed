import { Permission, PERMISSIONS, Role } from "shared";

export const ROLES: Record<Role, readonly Permission[]> = {
  Admin: PERMISSIONS,
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
