import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationCode } from 'simple-oauth2';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import {
  UnauthorizedException,
  OnModuleInit,
  Injectable,
} from '@nestjs/common';

import OAuth2Client, { ValidateFunc } from '../classes/OAuth2Client';
import { CodeResponse, OAuth2Options } from '../@types';
import authConfig from '../config/auth.config';
import { Provider } from '../providers';

@Injectable()
export class AuthenticatorService implements OnModuleInit {
  private clients: OAuth2Client[] = [];
  private jwtService!: JwtService;

  constructor(private readonly moduleRef: ModuleRef) {}

  public onModuleInit() {
    this.jwtService = this.moduleRef.get(JwtService, {
      strict: false,
    });

    this.clients.map((client) => client.setJwtService(this.jwtService));
  }

  public use(options: OAuth2Options, validate: ValidateFunc) {
    if (this.clients.find(({ Name }) => Name === options.name)) {
      throw new Error(`OAuth2 client with name ${options.name} already exists`);
    }

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      auth: { userInfo: _, ...auth },
      client,
    } = options.credentials;
    const oAuthClient = new OAuth2Client(
      options,
      new AuthorizationCode({
        auth,
        client,
      }),
      validate,
    );

    this.clients.push(oAuthClient);
  }

  public async redirectToAuth(
    name: Provider,
    reply: FastifyReply,
  ): Promise<true> {
    const client = this.clients.find(({ Name }) => Name === name);
    if (!client) {
      throw new Error(`No client found with name: ${name}`);
    }

    const uri = await client.generateAuthorizationUri();
    reply.redirect(307, uri);
    return true;
  }

  public async handleCallback(
    name: Provider,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<true> {
    const client = this.clients.find(({ Name }) => Name === name);
    if (!client) {
      throw new Error(`No client found with name: ${name}`);
    }

    try {
      const { code, state, scope }: CodeResponse = (request.query ??
        {}) as CodeResponse;

      if (!code || !state || !scope) {
        throw new UnauthorizedException();
      }

      const token = await client.getToken({
        code,
        state,
        scope,
      });

      if (!token?.token?.access_token || token?.expired()) {
        throw new UnauthorizedException();
      }

      const user = await client.startValidate(
        token.token.access_token,
        token.token,
      );

      if (!user) {
        throw new UnauthorizedException();
      }

      reply.redirect(307, authConfig.homePage);
    } catch {
      reply.redirect(307, authConfig.loginPage);
    }

    return true;
  }
}
