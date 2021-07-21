import { Injectable } from '@nestjs/common';

import { AuthenticatorService } from '../../authenticator/authenticator.service';
import { ValidateFunc } from '../../classes/OAuth2Client';
import { UserService } from '../../user/user.service';
import { OPEN_ID, versions } from '../../utils/app';
import { providers, scopes } from '../constants';
import googleConfig from './config';

@Injectable()
export default class GoogleStrategy {
  constructor(
    private readonly usersService: UserService,
    authenticator: AuthenticatorService,
  ) {
    authenticator.use(
      {
        name: providers.Google,
        credentials: {
          client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET,
          },
          auth: {
            authorizeHost: 'https://accounts.google.com',
            tokenHost: 'https://www.googleapis.com',
            authorizePath: '/o/oauth2/v2/auth',
            tokenPath: '/oauth2/v4/token',
            userInfo: OPEN_ID,
          },
        },
        callbackUri: `/v${versions.v1}/${googleConfig.callbackPath}`,
        scope: [scopes.Email, scopes.Profile],
      },
      this.validate.bind(this),
    );
  }

  private async validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...[_, data]: Parameters<ValidateFunc>
  ): ReturnType<ValidateFunc> {
    return this.usersService.saveOrUpdate(data.id, providers.Google, {
      uid: '',
      firstName: data.given_name,
      lastName: data.family_name,
      email: data.email,
      avatar: data.picture,
    });
  }
}
