import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Usar la constante ROLES_KEY
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());  //Trinca los roles que se pusieron en los decoradores de los controladores y que se alacenan como metadata en roles.decorator.ts
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest(); //Obtenemos el user del request para poder comprobar sus roles.
    if (!user || !user.roles) return false;
    /*
    context es un objeto de tipo ExecutionContext que te da información de la ejecución actual, ya sea HTTP, WebSocket, gRPC, etc.
    switchToHttp() → le dice a NestJS que queremos trabajar con la solicitud HTTP (request/response).
    getRequest() → devuelve el objeto Request de Express (o Fastify, según tu adaptador).
    const { user } = ... → extrae la propiedad user que normalmente inyecta el JwtAuthGuard cuando verifica el token.
    */

    //Verifica que al menos uno de los roles del usuario esté en los roles requeridos.
    return user.roles.some(role => requiredRoles.includes(role));
  }
}
