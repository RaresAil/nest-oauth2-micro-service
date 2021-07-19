import { CookieSerializeOptions } from 'fastify-cookie';
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
import { UsersService } from '../users/users.service';
import appConfig from '../config/app.config.json';
import { Provider } from '../providers/constants';
import authConfig from '../config/auth.config';
import { User } from '../users/user.class';

const isProduction = appConfig.NODE_ENV !== 'development';

@Injectable()
export class AuthenticatorService implements OnModuleInit {
  private cookieName = 'session' as const;
  private cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    signed: true,
    secure: isProduction,
    maxAge: 21600 * 1000,
    path: '/',
  };

  private clients: OAuth2Client[] = [];
  private jwtService!: JwtService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly usersService: UsersService,
  ) {}

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
  ): Promise<boolean> {
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

      reply.setCookie(this.cookieName, user.serialize(), this.cookieOptions);
      reply.redirect(307, authConfig.homePage);
      return true;
    } catch {
      reply.redirect(307, authConfig.loginPage);
      throw new UnauthorizedException();
    }
  }

  public async handleSession(
    request: FastifyRequest,
    replay: FastifyReply,
  ): Promise<boolean> {
    const { valid, value } =
      request.unsignCookie(request.cookies[this.cookieName] ?? '') ??
      ({} as ReturnType<typeof request['unsignCookie']>);

    if (!valid || !value) {
      replay.clearCookie(this.cookieName);
      throw new UnauthorizedException();
    }

    const { id, provider } = User.deserialize(value);
    const user = await this.usersService.getUser(id, provider);
    if (!user) {
      replay.clearCookie(this.cookieName);
      throw new UnauthorizedException();
    }

    return true;
  }
}
