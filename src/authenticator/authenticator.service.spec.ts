import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { URL } from 'url';

import { AuthenticatorService } from './authenticator.service';
import GoogleStrategy from '../providers/google/strategy';
import { UsersModule } from '../users/users.module';

import jwtConfig from '../../test/config/jwt.json';
import dbConfig from '../../test/config/db.json';
import { scopes } from '../providers/constants';

describe('AuthenticatorService', () => {
  let service: AuthenticatorService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        UsersModule,
        SequelizeModule.forRoot(dbConfig as any),
        JwtModule.register(jwtConfig),
      ],
      providers: [AuthenticatorService],
    }).compile();

    service = module.get<AuthenticatorService>(AuthenticatorService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should fail because provider is not defined', async () => {
    try {
      await service.redirectToAuth(
        'google',
        { redirect: () => true } as any,
        {
          hostname: 'localhost',
        } as any,
      );
    } catch ({ message }) {
      expect(message).toContain('No client found with name:');
    }
  });

  it('Should get the google url and validate the state', async () => {
    new GoogleStrategy(null, service);
    service.onModuleInit();

    const jwtService = module.get<JwtService>(JwtService);
    let state = '';

    await new Promise<void>((resolve) => {
      service.redirectToAuth(
        'google',
        {
          redirect: (code: number, uri: string) => {
            const url = new URL(uri);

            const response_type = url.searchParams.get('response_type');
            const scope = url.searchParams.get('scope');
            state = url.searchParams.get('state');

            expect(code).toBe(307);

            expect(scope).toBe([scopes.Email, scopes.Profile].join(' '));
            expect(url.hostname).toBe('accounts.google.com');
            expect(response_type).toBe('code');
            expect(state).toBeDefined();
            resolve();
          },
        } as any,
        {
          hostname: 'localhost',
        } as any,
      );
    });

    const { state: realState } = await jwtService.verifyAsync<any>(state);
    expect(realState).toBeDefined();
    expect(Buffer.from(realState, 'hex').byteLength).toBe(64);
  });
});
