import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phoneNo: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsEnum(['customer', 'technician', 'admin'])
  role: 'customer' | 'technician' | 'admin';
}
