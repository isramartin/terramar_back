import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();
    console.log("User.role:", user.roles);

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    // Validar roles
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.roles)) {
        throw new ForbiddenException(
          `Requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // Validar permisos
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some((permission) =>
        user.permissions?.includes(permission),
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Requiere uno de los siguientes permisos: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
