/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-require */
import path from 'path';

import { StrategyConfig, StrategyMethodConfig } from '../@types/strategy';
import { ValueOf } from '../utils/types';

export const providers = {
  Google: 'google',
} as const;

export const scopes = {
  Email: 'email',
  Profile: 'profile',
};

// Don't change this. \/

export type Provider = ValueOf<typeof providers>;

export const configs: {
  [key: string]: StrategyMethodConfig;
} = Object.values(providers).reduce((acc, provider: string) => {
  const {
    default: config,
  }: {
    default: StrategyConfig;
  } = require(path.join(__dirname, provider, 'config'));

  const conf: StrategyMethodConfig = {
    authorize: config.redirectPath,
    callback: config.callbackPath,
  };

  return {
    ...acc,
    [provider]: conf,
  };
}, {});
