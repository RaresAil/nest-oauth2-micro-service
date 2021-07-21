import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';

import { UserService } from './users.service';
import { User } from '../models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
