// src/business-logic/services/AuthService.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'canelones-de-siri';

export class AuthService {
  public login(username: string, password: string): string {
    const isValidUser = username === 'admin' && password === '123';

    if (!isValidUser) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      sub: 'user-id-123', 
      username: 'admin',
      roles: ['administrator'], 
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h', // 
    });

    return token;
  }
}