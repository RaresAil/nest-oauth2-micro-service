import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import googleConfig from '../providers/google/config';

import { AuthMethod, methods } from '../meta/auth-method.decorator';
import authConfig from '../config/auth.config';
import { versions } from '../utils/app';
import providers from '../providers';

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
