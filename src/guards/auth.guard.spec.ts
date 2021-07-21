import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleRef, Reflector } from '@nestjs/core';

import { AuthenticatorService } from '../authenticator/authenticator.service';
import { UserModule } from '../user/users.module';
import dbConfig from '../../test/config/db.json';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let module: TestingModule;
  let authGuard: AuthGuard;

  beforeEach(async () => {
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
