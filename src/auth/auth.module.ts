import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticatorService } from '../authenticator/authenticator.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { Strategies } from '../providers';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      privateKey: `-----BEGIN RSA PRIVATE KEY-----\n${process.env.JWT_PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`,
      publicKey: `-----BEGIN PUBLIC KEY-----\n${process.env.JWT_PUBLIC_KEY}\n-----END PUBLIC KEY-----`,
      signOptions: {
        algorithm: 'RS512',
      },
    }),
  ],
  providers: [...Strategies, AuthenticatorService],
  controllers: [AuthController],
})
export class AuthModule {}
