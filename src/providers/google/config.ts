import { StrategyConfig } from '../../@types/strategy';
import { providers } from '../constants';

const callbackPath = `${providers.Google}/callback`;
const config: StrategyConfig = {
  redirectPath: providers.Google,
  callbackPath,
};

export default config;
