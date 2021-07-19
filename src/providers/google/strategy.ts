import { Injectable } from '@nestjs/common';

import { AuthenticatorService } from '../../authenticator/authenticator.service';
import { ValidateFunc } from '../../classes/OAuth2Client';
import { UsersService } from '../../users/users.service';
import { OPEN_ID } from '../../config/auth.config';
import { User } from '../../users/user.class';
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
    const existingUser = await this.usersService.getUser(
      data.id,
      providers.Google,
    );
    if (existingUser) {
      return existingUser;
    }

    const user = await this.usersService.saveUser(
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
