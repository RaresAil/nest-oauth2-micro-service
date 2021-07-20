import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from '../models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
