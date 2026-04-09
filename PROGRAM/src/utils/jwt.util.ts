import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export class JwtUtil {
  static signAccessToken(user: any) {
    return jwt.sign(
      { sub: user.id, role: user.role },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessTtl },
    );
  }
}

