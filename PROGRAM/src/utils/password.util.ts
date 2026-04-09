import bcrypt from 'bcrypt';
import { env } from '../config/env';

export class PasswordUtil {
  static hash(password: string) {
    return bcrypt.hash(password, env.security.bcryptRounds);
  }

  static compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}

