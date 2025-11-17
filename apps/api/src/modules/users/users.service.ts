import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [
    { id: 1, email: 'user1@example.com' },
    { id: 2, email: 'user2@example.com' },
  ];

  getAllUsers() {
    return this.users;
  }
}
