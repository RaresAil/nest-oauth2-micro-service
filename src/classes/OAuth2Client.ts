import { AccessToken, AuthorizationCode } from 'simple-oauth2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import crypto from 'crypto';

import { CodeResponse, OAuth2Options } from '../@types';
import { isProduction, OPEN_ID } from '../utils/app';
import { Provider } from '../providers/constants';

export type ValidateFunc = (accessToken: string, data: any) => Promise<User>;

export default class OAuth2Client {
  private readonly stateLength = 64 as const;
  private jwtService: JwtService;

  public get Name(): Provider {
    return this.options.name.toString() as Provider;
  }

  constructor(
    private readonly options: OAuth2Options,
    private readonly authorizationCode: AuthorizationCode,
    private readonly validate: ValidateFunc,
  ) {}

  private parseRedirectUri(hostname: string): string {
    const { callbackUri } = this.options;
    const protocol = isProduction ? 'https' : 'http';

    return `${protocol}://${hostname}${
      callbackUri.startsWith('/') ? '' : '/'
    }${callbackUri}`;
  }

  public setJwtService(jwtService: JwtService): void {
    this.jwtService = jwtService;
  }

  public async generateAuthorizationUri(hostname: string): Promise<string> {
    if (!this.jwtService) {
      throw new Error('JwtService not set');
    }

    const encodedState = await this.jwtService.signAsync({
      state: crypto.randomBytes(this.stateLength).toString('hex'),
    });

    const options = {
      ...(this.options.callbackUriParams ?? {}),
      ...{
        redirect_uri: this.parseRedirectUri(hostname),
        scope: this.options.scope,
        state: encodedState,
      },
    };

    return this.authorizationCode.authorizeURL(options);
  }

  public async getToken(
    codeResponse: CodeResponse,
    hostname: string,
  ): Promise<AccessToken> {
    if (!this.jwtService) {
      throw new Error('JwtService not set');
    }

    const realState = await this.jwtService.verifyAsync(codeResponse.state);
    if (Buffer.from(realState.state, 'hex').byteLength !== this.stateLength) {
      throw new Error('Invalid state');
    }

    try {
      const accessToken = await this.authorizationCode.getToken({
        redirect_uri: this.parseRedirectUri(hostname),
        scope: codeResponse.scope,
        code: codeResponse.code,
      });

      return accessToken;
    } catch (error) {
      return null;
    }
  }

  public async startValidate(
    ...[accessToken, data]: Parameters<ValidateFunc>
  ): ReturnType<ValidateFunc> {
    let _data = { ...data };

    if (this.options.credentials.auth.userInfo === OPEN_ID) {
      const { sub, ...parsedData } = JSON.parse(
        Buffer.from(data.id_token.split('.')[1] ?? '', 'base64').toString(),
      );

      delete parsedData.iss;
      delete parsedData.azp;
      delete parsedData.aud;
      delete parsedData.at_hash;
      delete parsedData.iat;
      delete parsedData.exp;

      _data = { ...parsedData, id: sub };
    }

    return this.validate(accessToken, _data);
  }
}
