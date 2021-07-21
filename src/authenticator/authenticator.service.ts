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
import { UserService } from '../user/users.service';
import { Provider } from '../providers/constants';
import { isProduction } from '../utils/app';

@Injectable()
export class AuthenticatorService implements OnModuleInit {
  private cookieName = 'session' as const;
  private cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    signed: false,
    secure: isProduction,
    maxAge: 21600,
    path: '/',
  };

  private clients: OAuth2Client[] = [];
  private jwtService!: JwtService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly usersService: UserService,
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
    request: FastifyRequest,
  ): Promise<true> {
    const client = this.clients.find(({ Name }) => Name === name);
    if (!client) {
      throw new Error(`No client found with name: ${name}`);
    }

    const uri = await client.generateAuthorizationUri(request.hostname);
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

      const token = await client.getToken(
        {
          code,
          state,
          scope,
        },
        request.hostname,
      );

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

      const session = await this.signData(user.uid);
      reply.setCookie(this.cookieName, session, this.cookieOptions);
      reply.redirect(307, process.env.HOME_ROUTE);
      return true;
    } catch {
      reply.redirect(307, process.env.LOGIN_ROUTE);
      throw new UnauthorizedException();
    }
  }

  public async handleSession(
    request: FastifyRequest,
    replay: FastifyReply,
  ): Promise<boolean> {
    try {
      const uuid = await this.unsignData(request.cookies[this.cookieName]);
      const user = await this.usersService.getUser(uuid);

      if (!user) {
        throw new UnauthorizedException();
      }

      return true;
    } catch {
      replay.clearCookie(this.cookieName);
      throw new UnauthorizedException();
    }
  }

  private async signData(input: string): Promise<string> {
    return this.jwtService.signAsync({
      data: input,
    });
  }

  private async unsignData<T = any>(input: string): Promise<T> {
    const { data } = await this.jwtService.verifyAsync<any>(input);
    return data;
  }
}
