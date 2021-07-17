import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { TypeOfClassMethod } from '../utils/types';

@Injectable()
export class AuthService {
  public getUser: TypeOfClassMethod<UsersService, 'getUser'>;
  public saveUser: TypeOfClassMethod<UsersService, 'saveUser'>;

  constructor(userService: UsersService) {
    this.getUser = userService.getUser.bind(userService);
    this.saveUser = userService.saveUser.bind(userService);
  }
}
