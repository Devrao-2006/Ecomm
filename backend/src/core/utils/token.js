import crypto from 'crypto';

export function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function verifyTokenHash(rawToken, storedHash) {
  if (!rawToken || !storedHash) 
    return false;
  const incoming = Buffer.from(hashToken(rawToken), 'hex');
  const expected = Buffer.from(storedHash, 'hex');
  if (incoming.length !== expected.length) 
    return false;
  return crypto.timingSafeEqual(incoming, expected);
}
