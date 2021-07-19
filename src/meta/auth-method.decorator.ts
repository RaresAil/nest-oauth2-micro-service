import { SetMetadata } from '@nestjs/common';
import { ValueOf } from '../utils/types';
import { Provider } from '../providers';

export const name = 'auth-method' as const;

export interface AuthMethodData {
  provider: Provider;
  method: Method;
}

export const methods = {
  Authorize: 'authorize',
  Callback: 'callback',
} as const;

export type Method = ValueOf<typeof methods>;

export const AuthMethod = (provider: Provider, method: Method) =>
  SetMetadata(name, {
    provider,
    method,
  } as AuthMethodData);
