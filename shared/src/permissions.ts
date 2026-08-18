/** Lista de todas as permissões de acesso disponíveis no sistema. */
export const PERMISSIONS = [
  "user.create",
  "user.read",
  "user.edit",
  "user.edit.role",

  // Mantém a grafia legada usada pelo Admin/Técnico e a grafia correta.
  "schedule.aprove",
  "schedule.approve",
  "schedule.request",
  "schedule.read",

  "speciality.read",
  "speciality.edit",
  "speciality.create",
  "speciality.delete",

  "doctor.create",
  "doctor.read",
  "doctor.edit",
  "doctor.delete",

  "patient.create",
  "patient.read",
  "patient.edit",
  "patient.delete",

  "appointment.create",
  "appointment.read",
  "appointment.edit",
  "appointment.delete",
] as const;

export type Permission = typeof PERMISSIONS[number];
export type Role = "Admin" | "Tecnico" | "Paciente" | "Medico";
