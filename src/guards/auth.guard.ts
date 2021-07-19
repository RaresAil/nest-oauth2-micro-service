import { FastifyRequest, FastifyReply } from 'fastify';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  OnModuleInit,
  CanActivate,
  Injectable,
} from '@nestjs/common';

import { AuthMethodData, methods, name } from '../meta/auth-method.decorator';
import { AuthenticatorService } from '../authenticator/authenticator.service';

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authenticator!: AuthenticatorService;

  constructor(
    private reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  public onModuleInit() {
    this.authenticator = this.moduleRef.get(AuthenticatorService, {
      strict: false,
    });
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMethod = this.reflector.get<AuthMethodData>(
      name,
      context.getHandler(),
    );

    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    if (!authMethod) {
      return this.authenticator.handleSession(request, reply);
    }

    switch (authMethod.method) {
      case methods.Authorize:
        return this.authenticator.redirectToAuth(authMethod.provider, reply);
      case methods.Callback:
        return this.authenticator.handleCallback(
          authMethod.provider,
          request,
          reply,
        );
      default:
        return false;
    }
  }
}
