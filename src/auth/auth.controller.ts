import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { AuthMethod, methods } from '../meta/auth-method.decorator';
import googleConfig from '../config/google.config';
import authConfig from '../config/auth.config';
import { providers } from './strategies';
import { versions } from '../app.module';

@Controller({
  path: authConfig.prefix,
  version: versions.v1,
})
export class AuthController {
  @Get(googleConfig.callbackPath)
  @AuthMethod(providers.Google, methods.Callback)
  public authWithGoogle() {
    throw new InternalServerErrorException();
  }

  @Get(googleConfig.redirectPath)
  @AuthMethod(providers.Google, methods.Authorize)
  public loginWithGoogle() {
    throw new InternalServerErrorException();
  }
}
