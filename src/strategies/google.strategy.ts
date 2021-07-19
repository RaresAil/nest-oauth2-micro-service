import { Injectable } from '@nestjs/common';

import { ValidateFunc } from '../classes/OAuth2Client';
import { AuthenticatorService, providers } from '.';
import googleConfig from '../config/google.config';
import { AuthService } from '../auth/auth.service';
import { OPEN_ID } from '../config/auth.config';
import { User } from '../users/user.class';

@Injectable()
export class GoogleStrategy {
  constructor(
    private authService: AuthService,
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
            authorizePath: '/o/oauth2/v2/auth',
            tokenHost: 'https://www.googleapis.com',
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
    const existingUser = await this.authService.getUser(
      data.id,
      providers.Google,
    );
    if (existingUser) {
      return existingUser;
    }

    const user = await this.authService.saveUser(
      new User(
        data.id,
        data.given_name,
        data.family_name,
        data.email,
        data.picture,
        providers.Google,
      ),
    );
    return user;
  }
}
