import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import googleConfig from '../providers/google/config';

import { AuthMethod, methods } from '../meta/auth-method.decorator';
import { providers } from '../providers/constants';
import { versions } from '../utils/app';

@Controller({
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

  @Get('check')
  public check() {
    return {
      status: true,
    };
  }
}
