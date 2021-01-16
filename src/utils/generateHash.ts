import crypto from 'crypto';

export default function generateHash(password: string, salt: string): string {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}
