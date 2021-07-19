import { providers } from '../strategies';
import { versions } from '../utils/app';
import authConfig from './auth.config';

const callbackPath = `${providers.Google}/callback`;

export default {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${authConfig.domain}/v${versions.v1}/${authConfig.prefix}/${callbackPath}`,
  scope: ['profile', 'email'],
  redirectPath: providers.Google,
  callbackPath,
};
