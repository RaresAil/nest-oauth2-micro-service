import authConfig from '../../config/auth.config';
import { versions } from '../../utils/app';
import providers from '..';

const callbackPath = `${providers.Google}/callback`;

export default {
  callbackURL: `${authConfig.domain}/v${versions.v1}/${authConfig.prefix}/${callbackPath}`,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  clientID: process.env.GOOGLE_CLIENT_ID,
  redirectPath: providers.Google,
  scope: ['profile', 'email'],
  callbackPath,
};
