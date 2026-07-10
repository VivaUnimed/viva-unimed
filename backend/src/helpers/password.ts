import crypto from 'crypto';

interface HashedPassword {
  hash: string;
  salt: string;
}

/**
 * Hashes a password using PBKDF2 with a random salt.
 */
export function hashPassword(password: string): HashedPassword {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, 'sha512')
    .toString('hex');

  return { hash, salt };
}

/**
 * Compares a plaintext password against a stored hash + salt.
 */
export function comparePassword(password: string, stored: HashedPassword): boolean {
  const hash = crypto
    .pbkdf2Sync(password, stored.salt, 100_000, 64, 'sha512')
    .toString('hex');

  // Timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(stored.hash, 'hex')
  );
}
