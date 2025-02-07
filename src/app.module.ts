import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppwriteService } from './appwrite/appwrite.service';
import { AppwriteModule } from './appwrite/appwrite.module';
import { UsersModule } from './users/users.module';
import { GlobalExceptionFilter } from './utils/global-exception-filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesPermissionsGuard } from './guards/roles-permissions.guard';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ProductsController } from './products/products.controller';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    AppwriteModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible globalmente
    }),
    AuthModule,
    ProductsModule,
  ],
  controllers: [AppController, ProductsController],
  providers: [AppService, AppwriteService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // Aplica el middleware de autenticación
      .forRoutes('protected-route', 'another-protected-route'); // Especifica las rutas que requieren autenticación
  }
}
