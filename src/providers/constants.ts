import { ValueOf } from '../utils/types';

export const providers = {
  Google: 'google',
} as const;

export type Provider = ValueOf<typeof providers>;
