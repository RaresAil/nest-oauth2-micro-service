import appConfig from '../config/app.config.json';

export const isProduction = appConfig.NODE_ENV !== 'development';

export const OPEN_ID = 'openId';

export const versions = {
  v1: '1',
};
