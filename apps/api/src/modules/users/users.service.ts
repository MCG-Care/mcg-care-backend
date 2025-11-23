import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from '../../config/database.module';
import { db } from '../../config/database';
import { schema } from '../../config/database';
import { eq } from 'drizzle-orm';

type Database = typeof db;

@Injectable()
export class UsersService {
  constructor(@Inject(DB_PROVIDER) private readonly db: Database) {}

  // Example: Get all users
  async getAllUsers() {
    return await this.db.select().from(schema.users);
  }

  // Example: Get user by ID
  async getUserById(id: number) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return result[0] || null;
  }

  // Example: Get user by email
  async getUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return result[0] || null;
  }

  // Example: Create a new user
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    role: 'customer' | 'technician' | 'admin';
    addressId?: number;
  }) {
    const result = await this.db
      .insert(schema.users)
      .values(userData)
      .returning();

    return result[0];
  }

  // Example: Update user
  async updateUser(
    id: number,
    userData: Partial<{
      name: string;
      email: string;
      phoneNo: string;
      addressId: number;
    }>,
  ) {
    const result = await this.db
      .update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return result[0] || null;
  }

  // Example: Delete user
  async deleteUser(id: number) {
    const result = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();

    return result[0] || null;
  }
}
