import { Permission, PERMISSIONS, Role } from "shared";

export const ROLES: Record<Role, readonly Permission[]> = {
  Admin: PERMISSIONS,
  Tecnico: [
    "doctor.read",
    "patient.read",
    "appointment.read",
    "schedule.approve",
    "schedule.read",
    "user.read",
    "speciality.read",
    "speciality.create",
    "speciality.edit",
  ],
  Paciente: [
    "schedule.request",
    "speciality.read",
    "speciality.read", //para escolher o médico
    "appointment.read" //para ver suas próprias consultas
  ],
} as const;

export function getPermissionsFromRoles(roles: Role[] | undefined): Permission[] {
  if(!roles) return [];
  const all = roles.map(r => ROLES[r]).flat();
  return Array.from(new Set(all));
}
