import { AccessToken, AuthorizationCode } from 'simple-oauth2';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';

import { CodeResponse, OAuth2Options } from '../@types';
import { Provider } from '../providers/constants';
import { OPEN_ID } from '../config/auth.config';
import { User } from '../users/user.class';

export type ValidateFunc = (accessToken: string, data: any) => Promise<User>;

export default class OAuth2Client {
  private readonly stateLength = 32 as const;
  private jwtService: JwtService;

  public get Name(): Provider {
    return this.options.name.toString() as Provider;
  }

  constructor(
    private readonly options: OAuth2Options,
    private readonly authorizationCode: AuthorizationCode,
    private readonly validate: ValidateFunc,
  ) {}

  public setJwtService(jwtService: JwtService): void {
    this.jwtService = jwtService;
  }

  public async generateAuthorizationUri(): Promise<string> {
    if (!this.jwtService) {
      throw new Error('JwtService not set');
    }

    const encodedState = await this.jwtService.signAsync({
      state: crypto.randomBytes(this.stateLength).toString('hex'),
    });

    const options = {
      ...(this.options.callbackUriParams ?? {}),
      ...{
        redirect_uri: this.options.callbackUri,
        scope: this.options.scope,
        state: encodedState,
      },
    };

    return this.authorizationCode.authorizeURL(options);
  }

  public async getToken(codeResponse: CodeResponse): Promise<AccessToken> {
    if (!this.jwtService) {
      throw new Error('JwtService not set');
    }

    const realState = await this.jwtService.verifyAsync(codeResponse.state);
    if (Buffer.from(realState.state, 'hex').byteLength !== this.stateLength) {
      throw new Error('Invalid state');
    }

    try {
      const accessToken = await this.authorizationCode.getToken({
        redirect_uri: this.options.callbackUri,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { iss, azp, aud, sub, at_hash, iat, exp, ...restData } = JSON.parse(
        Buffer.from(data.id_token.split('.')[1] ?? '', 'base64').toString(),
      );

      _data = { ...restData, id: sub };
    }

    return this.validate(accessToken, _data);
  }
}
