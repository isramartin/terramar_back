import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar si el usuario existe con el id del payload
    const user = await this.usersService.getUserData(payload.sub);
    if (!user) {
      return null; // Si no existe el usuario, el guard fallará
    }

    // Asignar el rol y permisos del payload al objeto user
    user.roles = payload.roles?.name; // Asignar el rol del payload
    user.permissions = payload.roles?.permissions; // Asignar permisos del payload

    // Asegurarse de que se asignan correctamente
    console.log('User with role and permissions:', user);

    // Devolver el objeto user con rol y permisos
    return user;
  }
}
