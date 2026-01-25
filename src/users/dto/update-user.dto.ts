import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsString, IsEmail, Min, IsOptional, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
     
    // @IsOptional()
    // @IsString()
    // name: string;
    
    // @IsOptional()
    // @IsEmail()
    // email: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({ each: true })
    roles?: string[];

    @IsOptional()
    @IsInt()
    @Min(0) // Para evitar edades negativas
    age: number;
}
