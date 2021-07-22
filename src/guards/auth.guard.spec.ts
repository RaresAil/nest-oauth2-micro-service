import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleRef } from '@nestjs/core';

import { AuthenticatorService } from '../authenticator/authenticator.service';
import { UserModule } from '../user/user.module';
import { AuthGuard } from './auth.guard';

import dbConfig from '../../test/config/db.json';

describe('AuthGuard', () => {
  let module: TestingModule;
  let moduleRef: ModuleRef;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule, SequelizeModule.forRoot(dbConfig as any)],
      providers: [AuthenticatorService],
    }).compile();

    moduleRef = module.get<ModuleRef>(ModuleRef);
  });

  describe('Test invalid method', () => {
    let authGuard: AuthGuard;
    beforeAll(async () => {
      authGuard = new AuthGuard(
        {
          get: () => 'invalid',
        } as any,
        moduleRef,
      );
      authGuard.onModuleInit();
    });

    it('canActivate should return false because method is not valid', async () => {
      const value = await authGuard.canActivate({
        getHandler: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => null,
          getResponse: () => null,
        }),
      } as any);

      expect(value).toBeFalsy();
    });
  });
});
