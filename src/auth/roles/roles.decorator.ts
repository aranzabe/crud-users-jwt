import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/*
Aquí es donde realmente se lee la metadata que definiste con @Roles().
RolesGuard no funciona por sí solo, necesita que alguien le diga qué roles son requeridos, y eso se hace a través del decorator.
*/