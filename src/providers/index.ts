/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-require */
import path from 'path';

import { providers } from './constants';

export const Strategies = Object.values(providers).map((provider: string) => {
  const strategy = require(path.join(__dirname, provider, 'strategy'));
  return strategy.default;
});
