import { HttpCode, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';



@Injectable()
export class UsersService {
  

  //Simulamos la bd. 
  private users : User[]= [
    {
      id: 1,
      name: 'Alberto',
      email: 'alberto@example.com',
      age: 30,
      roles: ['admin'],
      password: 'adminpass',
    },
    {
      id: 2,
      name: 'Diego',
      email: 'diego@example.com',
      age: 25,
      roles: ['user'],
      password: 'userpass',
    },
    {
      id: 3,
      name: 'Ian',
      email: 'ian@example.com',
      age: 25,
      roles: ['user','admin'],
      password: 'allpass',
    }
  ];

  private generateUniqueId = () => {
    let newId;
    do {
      newId = Math.floor(Math.random() * 1000) + 1;
    } while (this.users.some(user => user.id === newId)); 
    return newId;
  };

  create(createUserDto: CreateUserDto) {
      const user = new User();
      user.id = this.generateUniqueId();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.age = createUserDto.age;
      user.roles = createUserDto.roles || ['user']; // default si no se pasa
      this.users.push(user);
      return user; 
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    if (this.users.find(user => user.id === id) === undefined) {
      return {msg: 'User not found'};
      //throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.users.find(user => user.id === id);
  }

  findEmail(email: string) {
    const user = this.users.find(user => user.email === email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }
  

  update(id: number, updateUserDto: UpdateUserDto) {
      const userIndex = this.users.findIndex(user => user.id === id);
    
      if (userIndex === -1) {
        return { msg: 'User not found' };
        //throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
    
      //Actualizar solo los campos proporcionados en updateUserDto
      //Operador spread (...): Se mantiene el objeto original y solo se sobrescriben los valores proporcionados en updateUserDto, dejando los demás intactos.
      //Utiliza el operador spread (...) para fusionar el usuario existente con los nuevos datos 
      this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
    
      return this.users[userIndex];
  }
  

  remove(id: number) {
      const userIndex = this.users.findIndex(user => user.id === id);
    
      if (userIndex === -1) {
        return { msg: 'User not found' };
        //throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      const deletedUser = this.users.splice(userIndex, 1)[0];
      
      return { msg: 'User deleted successfully', deletedUser };
  }
  
}


      /*     
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
   
      throw new BadRequestException('El nombre de usuario ya existe')
    
      throw new InternalServerErrorException('Error al crear el usuario - Revisar logs')

      throw new HttpException({ msg: 'User not found' }, HttpStatus.NOT_FOUND);
      */