// src/presentation/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../business-logic/services/AuthService';

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      const token = this.authService.login(username, password);

      res.status(200).json({
        message: 'Login successful',
        accessToken: token,
      });
    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
  };
}