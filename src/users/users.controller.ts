import { Controller, Get, Post, Body, Patch, Put, Param, Delete, ParseIntPipe,ValidationPipe, UsePipes, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Validate } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SetMetadata } from '@nestjs/common';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';

// Decorador para roles, artesanal (se puede poner en un archivo aparte, como hacemos con JwtAuthGuard)
//export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(ValidationPipe) // Se aplica a todos los métodos del controlador
// @UsePipes(new ValidationPipe({  //Validación global
//           whitelist: true, //Rechaza campos no definidos en el DTO
//           forbidNonWhitelisted: true, //Lanza un error si hay campos extra
//           transform: true //Convierte tipos automáticamente
//       })) // Se aplica a todos los métodos del controlador

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin', 'user') //Internamente, NestJS almacena { roles: ['admin', 'user'] } para ese método.
  @UsePipes(ValidationPipe)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('user')
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
