import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/auth.dto';
import { errorsResponse } from 'src/utils/errorResponse';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { Users } from 'node-appwrite';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    
    const user = await this.usersService.findByEmail(loginDto.email);
    console.log("user", user)
    // const roleId = await this.usersService.getRoleById(loginDto.e);

    if (!user) {
      return errorsResponse([
        {
          key: 'email',
          type: 'unauthorized',
          message: `Credenciales inválidas`,
        },
      ]);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      return errorsResponse([
        {
          key: 'password',
          type: 'unauthorized',
          message: `Contraseña incorrecta`,
        },
      ]);
    }

    const roles = await this.usersService.getRoleById(user.Id_rol);
    console.log("roles", roles)
    console.log('Permisos del rol:', roles?.permissions);

    if (!user) {
      return errorsResponse([
        {
          key: 'email',
          type: 'unauthorized',
          message: `Credenciales inválidas`,
        },
      ]);
    }

    // // Obtener roles y permisos del usuario
    const rol = roles.name
    const permissions = roles.permissions || [];


    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const secret = this.configService.get<string>('JWT_SECRET');

    // Generar el token JWT
    const access_token = this.jwtService.sign(payload, { secret });

    // Obtener el rol principal del usuario (asumiendo que el primer rol es el principal)
    // const permissions = permission.length // Si no tiene roles, se asigna 'user' por defecto

    return {
      access_token,
      rol, // Devolver el rol del usuario
      permissions
    };
  }
}