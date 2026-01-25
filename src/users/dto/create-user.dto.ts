import { isNumberObject } from "node:util/types";
import { IsInt, IsString, IsEmail, Min, IsOptional, ArrayNotEmpty, ArrayUnique, IsArray } from 'class-validator';

export class CreateUserDto {
    
  
  // @IsInt()
  // id: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0) // Para evitar edades negativas
  age: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()        // opcional, evita array vacío
  @ArrayUnique()          // opcional, evita roles duplicados
  @IsString({ each: true }) // valida cada elemento del array
  roles?: string[];
}
