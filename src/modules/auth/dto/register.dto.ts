import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Roles } from 'src/entities/role.entity';

export class RegisterDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsArray()
  @IsEnum(Roles, { each: true })
  roles: string[];
}

export default RegisterDto;
