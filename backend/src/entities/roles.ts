import { Permission, PERMISSIONS, Role } from "shared";

export const ROLES: Record<Role, readonly Permission[]> = {
  Admin: PERMISSIONS,

  Tecnico: [
    "schedule.aprove",
    "schedule.approve",
    "schedule.read",
    "schedule.request",

    "user.create",
    "user.read",
    "user.edit",

    "doctor.create",
    "doctor.read",
    "doctor.edit",

    "patient.create",
    "patient.read",
    "patient.edit",

    "appointment.read",
    "appointment.create",
    "appointment.edit",
    "appointment.delete",

    "speciality.read",
    "speciality.create",
    "speciality.edit",
  ],

  Paciente: [
    "schedule.request",
    "schedule.read",
    "speciality.read",
  ],

  Medico: [
    "doctor.read",
    "patient.read",
    "appointment.read",
    "schedule.read",
  ],
} as const;

export function getPermissionsFromRoles(roles: Role[] | undefined): Permission[] {
  if (!roles) return [];
  const all = roles.flatMap((role) => ROLES[role] ?? []);
  return Array.from(new Set(all));
}
