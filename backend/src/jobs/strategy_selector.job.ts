export interface IMatchStrategy {
  mode: 'SEQUENTIAL' | 'CURRENT';
  batchSize: number; // quantos pacientes notificar por vez
  expiresInMinutes: number // tempo de validade do match
}

export function getMatchStrategy(appointmentDate: Date): IMatchStrategy {
  const timeUntilAppointment = appointmentDate.getTime() - Date.now();
  const hoursLeft = timeUntilAppointment / (1000 * 60 * 60);

  if (hoursLeft < 48) {
    // vaga urgente (menos de 2 dias): vários usuários notificados
    return { mode: 'CURRENT', batchSize: 5, expiresInMinutes: 30 };
  }
   // vaga longe: fila, 1 por vez
  return { mode: 'SEQUENTIAL', batchSize: 1, expiresInMinutes: 240 };
}
