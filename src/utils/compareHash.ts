import passwordHasher from './generateHash';

export default function compareHash(
  password: string,
  salt: string,
  hash: string,
): boolean {
  const hashedPassword = passwordHasher(password, salt);
  if (hashedPassword === hash) {
    return true;
  }
  return false;
}
