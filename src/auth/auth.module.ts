import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/guards/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AppwriteService } from 'src/appwrite/appwrite.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // Registra Passport con la estrategia JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // Opcional: configura la expiración del token
      }),
      inject: [ConfigService],
    }),
    UsersModule, // Importa el módulo de usuarios si es necesario
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService,JwtStrategy, AppwriteService],
  exports: [AuthService, JwtModule, PassportModule],

})
export class AuthModule {}