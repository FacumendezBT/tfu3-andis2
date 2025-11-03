// src/presentation/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'canelones-de-siri';

export const gatekeeper = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Acceso denegado. El token está malformado.' });
      return;
    }

    const decodedPayload = jwt.verify(token, JWT_SECRET);

    next();
  } catch (error) {
    res.status(403).json({ message: 'Acceso prohibido. Token inválido o expirado.' });
  }
};