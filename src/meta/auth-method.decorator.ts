import { SetMetadata, applyDecorators, Get } from '@nestjs/common';

import { Provider, configs } from '../providers/constants';
import { ValueOf } from '../utils/types';

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
  applyDecorators(
    Get(configs[provider.toString()][method.toString()]),
    SetMetadata(name, {
      provider,
      method,
    } as AuthMethodData),
  );
