export interface StrategyMethodConfig {
  authorize: string;
  callback: string;
}

export interface StrategyConfig {
  redirectPath: string;
  callbackPath: string;
}
