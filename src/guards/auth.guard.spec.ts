import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleRef } from '@nestjs/core';

import { methods } from '../meta/auth-method.decorator';
import { providers } from '../providers/constants';
import { UserModule } from '../user/user.module';
import {
  AuthenticatorService,
  noClientError,
} from '../authenticator/authenticator.service';
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

  describe('Failing cases', () => {
    it('canActivate should return false because method is not valid', async () => {
      const authGuard = new AuthGuard(
        {
          get: () => ({}),
        } as any,
        moduleRef,
      );
      authGuard.onModuleInit();

      const value = await authGuard.canActivate({
        getHandler: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => null,
          getResponse: () => null,
        }),
      } as any);

      expect(value).toBeFalsy();
    });

    it('canActivate should throw an error because provider is not defined', async () => {
      const name = providers.Google;
      const authGuard = new AuthGuard(
        {
          get: () => ({
            method: methods.Authorize,
            provider: name,
          }),
        } as any,
        moduleRef,
      );
      authGuard.onModuleInit();

      try {
        await authGuard.canActivate({
          getHandler: () => jest.fn(),
          switchToHttp: () => ({
            getRequest: () => null,
            getResponse: () => null,
          }),
        } as any);
      } catch ({ message }) {
        expect(message).toBe(noClientError(name));
      }
    });
  });
});
