import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { AuthenticatorService, noClientError } from './authenticator.service';
import { providers, scopes } from '../providers/constants';
import GoogleStrategy from '../providers/google/strategy';
import { UserModule } from '../user/user.module';

import jwtConfig from '../../test/config/jwt.json';

describe('Authenticator Service', () => {
  let service: AuthenticatorService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule, JwtModule.register(jwtConfig)],
      providers: [AuthenticatorService],
    }).compile();

    service = module.get<AuthenticatorService>(AuthenticatorService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should fail because provider is not defined', async () => {
    const name = providers.Google;
    try {
      await service.redirectToAuth(
        name,
        { redirect: () => true } as any,
        {
          hostname: 'localhost',
        } as any,
      );
    } catch ({ message }) {
      expect(message).toBe(noClientError(name));
    }
  });

  it('Should get the google url and validate the state', async () => {
    new GoogleStrategy(null, service);
    service.onModuleInit();

    const jwtService = module.get<JwtService>(JwtService);
    let state = '';

    await new Promise<void>((resolve) => {
      service.redirectToAuth(
        providers.Google,
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
