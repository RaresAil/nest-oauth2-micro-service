import appConfig from '../config/app.config.json';

if (appConfig.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}
