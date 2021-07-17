import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Reflector } from '@nestjs/core';

import { AuthMethodData, methods, name } from '../meta/auth-method.decorator';
import authenticator from '../auth/strategies';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMethod = this.reflector.get<AuthMethodData>(
      name,
      context.getHandler(),
    );

    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    if (!authMethod) {
      return this.handleSession(request);
    }

    switch (authMethod.method) {
      case methods.Authorize:
        return authenticator.redirectToAuth(authMethod.provider, reply);
      case methods.Callback:
        return authenticator.handleCallback(
          authMethod.provider,
          request,
          reply,
        );
      default:
        return false;
    }
  }

  private async handleSession(request: FastifyRequest): Promise<boolean> {
    return false;
  }
}
