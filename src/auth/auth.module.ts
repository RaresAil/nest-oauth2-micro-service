import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticatorService } from '../authenticator/authenticator.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Strategies } from '../providers';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY,
      signOptions: {
        algorithm: 'RS512',
      },
    }),
  ],
  providers: [AuthService, ...Strategies, AuthenticatorService],
  controllers: [AuthController],
})
export class AuthModule {}
