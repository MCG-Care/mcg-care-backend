import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from '../../config/database.module';
import { db, Database } from '../../config/database';
import { schema } from '../../config/database';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DB_PROVIDER) private readonly db: Database) {}

  async getAllUsers() {
    return this.db.select().from(schema.users);
  }

  async getUserById(id: number) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async getUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    role: 'customer' | 'technician' | 'admin';
    addressId: number;
  }) {
    const result = await this.db.insert(schema.users).values(data).returning();

    return result[0];
  }

  async createAddress(dto: AddressDto) {
    const result = await this.db.insert(schema.addresses).values(dto).returning();

    return result[0];
  }

  async updateUser(id: number, data: UpdateUserDto) {
    const result = await this.db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteUser(id: number) {
    const result = await this.db.delete(schema.users).where(eq(schema.users.id, id)).returning();

    return result[0] || null;
  }
}
