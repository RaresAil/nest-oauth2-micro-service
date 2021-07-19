import { FastifyRequest, FastifyReply } from 'fastify';
import { ModuleRef, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  ExecutionContext,
  OnModuleInit,
  CanActivate,
  Injectable,
} from '@nestjs/common';

import { AuthMethodData, methods, name } from '../meta/auth-method.decorator';
import { AuthenticatorService } from '../strategies';

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authenticator!: AuthenticatorService;
  private jwtService!: JwtService;

  constructor(
    private reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  public onModuleInit() {
    this.authenticator = this.moduleRef.get(AuthenticatorService, {
      strict: false,
    });
    this.jwtService = this.moduleRef.get(JwtService, {
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
      return this.handleSession(request);
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

  private async handleSession(request: FastifyRequest): Promise<boolean> {
    return false;
  }
}
