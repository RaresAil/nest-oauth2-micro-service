import AppConfig from '../config/app.config.json';

if (AppConfig.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}
