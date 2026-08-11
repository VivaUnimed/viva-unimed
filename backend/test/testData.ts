let sequence = 0;

export function uniqueSuffix(label = 'test'): string {
  sequence += 1;
  return `${label}-${Date.now()}-${process.pid}-${sequence}`;
}

/**
 * Gera CRM exclusivo com no máximo 20 caracteres.
 * O banco usa VARCHAR(20), portanto qualquer valor maior causa erro 22001.
 */
export function uniqueCrm(prefix = 'CRM'): string {
  sequence += 1;

  const numeric = `${Date.now()}${process.pid}${sequence}`
    .replace(/\D/g, '')
    .slice(-14);

  return `${prefix.slice(0, 5).toUpperCase()}-${numeric}`.slice(0, 20);
}

/**
 * Gera um CPF matematicamente válido a partir de um texto.
 */
export function uniqueCpf(label = 'cpf'): string {
  const source = uniqueSuffix(label)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  const base = String((source * 7919 + sequence * 104729) % 1_000_000_000)
    .padStart(9, '0')
    .split('')
    .map(Number);

  const calculateDigit = (digits: number[]): number => {
    const factor = digits.length + 1;
    const sum = digits.reduce(
      (total, digit, index) => total + digit * (factor - index),
      0,
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  base.push(calculateDigit(base));
  base.push(calculateDigit(base));

  return base.join('');
}

export function futureDate(days: number, extraMinutes = 0): Date {
  const date = new Date(
    Date.now() +
      days * 24 * 60 * 60 * 1000 +
      extraMinutes * 60 * 1000,
  );

  date.setSeconds(0, 0);
  return date;
}
