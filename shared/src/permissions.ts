/** Lista de todas as permissões de acesso disponíveis no sistema */
export const PERMISSIONS = [
  "user.create",
  "user.read",
  "user.edit",
  "user.edit.role",
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
  "appointment.delete"
] as const;

/** Tipo derivado que restringe strings apenas aos valores definidos em PERMISSIONS */
export type Permission = typeof PERMISSIONS[number];

/** Define os perfis de usuário (cargos) que agrupam conjuntos de permissões */
export type Role = 'Admin' | 'Tecnico' | 'Paciente' | 'Medico';
