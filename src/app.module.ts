import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
