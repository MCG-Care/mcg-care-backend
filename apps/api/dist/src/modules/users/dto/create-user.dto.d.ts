import { AddressDto } from './address.dto';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    address: AddressDto;
    role: 'customer' | 'technician' | 'admin';
}
