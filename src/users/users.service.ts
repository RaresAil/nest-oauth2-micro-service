import { Injectable } from '@nestjs/common';
import { User } from './user.class';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  public async getUser(
    id: string,
    provider: User['provider'],
  ): Promise<User | undefined> {
    return this.users.find(
      (user) => user.id === id && user.provider === provider,
    );
  }

  public async saveUser(user: User): Promise<User | undefined> {
    this.users.push(user);
    return user;
  }
}
