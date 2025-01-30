import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del header

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
      const payload = this.jwtService.verify(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.roles?.name, // Asignamos el rol
        permissions: payload.roles?.permissions || [], // Asignamos los permisos
      };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  }
}
