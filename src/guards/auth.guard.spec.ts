import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleRef, Reflector } from '@nestjs/core';

import { AuthenticatorService } from '../authenticator/authenticator.service';
import { UserModule } from '../user/user.module';
import { AuthGuard } from './auth.guard';

import dbConfig from '../../test/config/db.json';

describe('AuthGuard', () => {
  let module: TestingModule;
  let authGuard: AuthGuard;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule, SequelizeModule.forRoot(dbConfig as any)],
      providers: [AuthenticatorService],
    }).compile();

    const reflector = module.get<Reflector>(Reflector);
    const moduleRef = module.get<ModuleRef>(ModuleRef);

    authGuard = new AuthGuard(reflector, moduleRef);
    authGuard.onModuleInit();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });
});
