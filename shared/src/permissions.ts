/** Lista de todas as permissões de acesso disponíveis no sistema */
export const PERMISSIONS = [
  "user.create",
  "user.read",
  "user.edit",
  "user.edit.role",
  "schedule.aprove",
  "schedule.request",
] as const;

/** Tipo derivado que restringe strings apenas aos valores definidos em PERMISSIONS */
export type Permission = typeof PERMISSIONS[number];

/** Define os perfis de usuário (cargos) que agrupam conjuntos de permissões */
export type Role = 'Admin' | 'Tecnico' | 'Cliente';
