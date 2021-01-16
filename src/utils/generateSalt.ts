import crypto from 'crypto';

export default function generateSalt(rounds = 12): string {
  return crypto
    .randomBytes(Math.ceil(rounds / 2))
    .toString('hex')
    .slice(0, rounds);
}
