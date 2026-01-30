# NestJS y JWT

**Instalamos los paquetes que nos harán falta:**

```jsx
yarn add  @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
```

- @nestjs/jwt: Manejo de JWT en NestJS.
- @nestjs/passport: Integración con Passport para autenticación.
- passport: Librería de autenticación.
- passport-jwt: Estrategia de Passport para JWT.
- bcrypt: Para encriptar contraseñas.

Creamos de forma independiente el módulo, controlador y servicio de auth. No usamos nest g res auth para que no nos haga el crud que no será necesario y para tener más control sobre lo que se crea:

```jsx
nest generate module auth
nest generate service auth --no-spec
nest generate controller auth --no-spec
nest g guard auth/roles
```
Crear strategy para JWT:
```jsx
nest g provider auth/jwt.strategy
```

Crear guard para JWT:
```jsx
nest g guard auth/jwt
```

Resumen:
```jsx
nest new api
cd api

yarn add @nestjs/jwt @nestjs/passport passport passport-jwt
yarn add -D @types/bcrypt

nest g module auth
nest g service auth
nest g controller auth
nest g provider auth/jwt.strategy
nest g guard auth/jwt

```

Para los roles.
**roles.decorator.ts**
```jsx
nest g provider auth/roles.decorator --flat
```
Y **roles.guard.ts**
```jsx
nest g guard auth/roles
```

**Configurar el servicio de autenticación**

```jsx
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  

  constructor(private readonly usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = this.usersService.findEmail(email);

    if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
    }

    console.log(user);
    console.log('User password:', user.password);
    console.log('Input password:', pass);

    if (pass === user.password) {
        const { password, ...result } = user; //Excluimos la contraseña antes de devolver el usuario
        console.log(result);
        return result;
    }

    throw new UnauthorizedException('Invalid credentials');
}

  

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

```

**Configurar JWT Strategy**

Crea el archivo `jwt.strategy.ts` en `auth/`.

```jsx
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', //Usa una variable de entorno en producción.
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

```

**Configurar el módulo de autenticación**

Edita `auth.module.ts` para incluir la configuración de JWT.

```jsx
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,   //Importamos el módulo de usuarios.
    PassportModule,
    JwtModule.register({
      secret: 'secretKey', //Usa variables de entorno en producción.
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], //Exportamos para que UsersModule pueda usarlo.
})
export class AuthModule {}

```

**Crear el controlador de autenticación**

Edita `auth.controller.ts` para manejar el login.

```jsx
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}

```

**Proteger las rutas con `AuthGuard`**

Crea el archivo `jwt-auth.guard.ts` en `auth/`.

```jsx
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, { secret: 'secretKey' });
      request.user = decoded;

      if (!requiredRoles) return true;
      return requiredRoles.includes(decoded.role);
    } catch {
      return false;
    }
  }
}

```

**Añadir protección a UsersController**

Edita `users.controller.ts` para proteger las rutas con `JwtAuthGuard` y el decorador `Roles`.

```jsx
import { Controller, Get, Post, Body, Patch, Put, Param, Delete, ParseIntPipe,ValidationPipe, UsePipes, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Validate } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SetMetadata } from '@nestjs/common';

// Decorador para roles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('users')
@UseGuards(JwtAuthGuard)
@UsePipes(ValidationPipe) // Se aplica a todos los métodos del controlador
// @UsePipes(new ValidationPipe({  //Validación global
//           whitelist: true, //Rechaza campos no definidos en el DTO
//           forbidNonWhitelisted: true, //Lanza un error si hay campos extra
//           transform: true //Convierte tipos automáticamente
//       })) // Se aplica a todos los métodos del controlador

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @UsePipes(ValidationPipe)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)  // Cambia el código de estado de la respuesta
  findOne(@Param('id', ParseIntPipe) id: number) {
      return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  //@UsePipes(ValidationPipe)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

```

**Actualizar `app.module.ts`**

Importa el módulo de autenticación, aunque seguramente se haya hecho ya automáticamente.

```jsx
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

```