import { providers } from '../auth/strategies';
import authConfig from './auth.config';

const callbackPath = `${providers.Google}/callback`;

export default {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${authConfig.domain}/${authConfig.prefix}/${callbackPath}`,
  scope: ['profile', 'email'],
  redirectPath: providers.Google,
  callbackPath,
};
