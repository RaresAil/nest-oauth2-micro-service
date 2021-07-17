import { Provider } from '../strategies';

export interface OAuth2Options {
  name: Provider;
  scope: string[];
  credentials: Credentials;
  callbackUri: string;
  callbackUriParams?: {
    [key: string]: string;
  };
}

export interface OAuth2Token {
  token_type: 'bearer';
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface ProviderConfiguration {
  authorizeHost: string;
  authorizePath: string;
  tokenHost: string;
  tokenPath: string;
  userInfo?: string;
}

export interface Credentials {
  client: {
    id: string;
    secret: string;
  };
  auth: ProviderConfiguration;
}

export interface CodeResponse {
  code: string;
  state: string;
  scope: string;
}
