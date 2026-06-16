import { HOUR } from "../constants";

export interface IMatchStrategy {
  mode: 'SEQUENTIAL' | 'CURRENT';
  batchSize: number; // quantos pacientes notificar por vez
  expiresInMinutes: number // tempo de validade do match
}

export type StrategyPreference =
  | 'DYNAMIC' // urgente manda pra vários, longe manda sequencial
  | 'STRICT_SEQUENTIAL' // envio 1 a 1, sem exceção (evita a frustração)
  | 'STRICT_BATCH'; // envio em massa (caso deseja-se priorizar preenchimento rápido)

export function getMatchStrategy(
  appointmentDate: Date,
  queueSize: number,
  preference: StrategyPreference = 'DYNAMIC' // Valor padrão para manter compatibilidade
): IMatchStrategy {

  const hoursLeft = (appointmentDate.getTime() - Date.now()) / HOUR;


  // forçar a fila um a um
  if (preference === 'STRICT_SEQUENTIAL') {
    return { mode: 'SEQUENTIAL', batchSize: 1, expiresInMinutes: calculateDynamicExpiration(queueSize) };
  }

  // forçar o envio em massa
  if (preference === 'STRICT_BATCH') {
    return { mode: 'CURRENT', batchSize: 5, expiresInMinutes: 30 };
  }

  // modo dinâmico
  if (hoursLeft < 48) {
    return { mode: 'CURRENT', batchSize: 5, expiresInMinutes: 30 };
  }

  return { mode: 'SEQUENTIAL', batchSize: 1, expiresInMinutes: calculateDynamicExpiration(queueSize) };
}

function calculateDynamicExpiration(queueSize: number) {
  if (queueSize > 10) return 30;
  if (queueSize > 3) return 60;
  return 120;
}
