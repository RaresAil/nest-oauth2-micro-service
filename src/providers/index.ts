import { ValueOf } from '../utils/types';

import { GoogleStrategy } from './google/strategy';

const providers = {
  Google: 'google',
} as const;

export type Provider = ValueOf<typeof providers>;

export const Strategies = [GoogleStrategy];

export default providers;
