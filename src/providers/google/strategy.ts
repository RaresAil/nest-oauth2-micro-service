import { Injectable } from '@nestjs/common';

import { AuthenticatorService } from '../../authenticator/authenticator.service';
import { ValidateFunc } from '../../classes/OAuth2Client';
import { UsersService } from '../../users/users.service';
import { OPEN_ID } from '../../config/auth.config';
import { providers } from '../constants';
import googleConfig from './config';

@Injectable()
export class GoogleStrategy {
  constructor(
    private readonly usersService: UsersService,
    authenticator: AuthenticatorService,
  ) {
    authenticator.use(
      {
        name: providers.Google,
        credentials: {
          client: {
            id: googleConfig.clientID,
            secret: googleConfig.clientSecret,
          },
          auth: {
            authorizeHost: 'https://accounts.google.com',
            tokenHost: 'https://www.googleapis.com',
            authorizePath: '/o/oauth2/v2/auth',
            tokenPath: '/oauth2/v4/token',
            userInfo: OPEN_ID,
          },
        },
        callbackUri: googleConfig.callbackURL,
        scope: googleConfig.scope,
      },
      this.validate.bind(this),
    );
  }

  private async validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...[_, data]: Parameters<ValidateFunc>
  ): ReturnType<ValidateFunc> {
    return this.usersService.saveOrUpdate({
      uid: this.usersService.serializeUser(data.id, providers.Google),
      firstName: data.given_name,
      lastName: data.family_name,
      email: data.email,
      avatar: data.picture,
    });
  }
}
