import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import path from 'path';
import fs from 'fs';

import { AuthenticatorService } from '../authenticator/authenticator.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Strategies } from '../providers';

const getKey = (name: 'private' | 'public') =>
  fs.readFileSync(path.join(__dirname, `../../certs/${name}.pem`));

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      privateKey: getKey('private'),
      publicKey: getKey('public'),
      signOptions: {
        algorithm: 'RS512',
      },
    }),
  ],
  providers: [AuthService, ...Strategies, AuthenticatorService],
  controllers: [AuthController],
})
export class AuthModule {}
