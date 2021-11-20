import { CookieSerializeOptions } from 'fastify-cookie';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationCode } from 'simple-oauth2';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { v5 } from 'uuid';
import {
  UnauthorizedException,
  OnModuleInit,
  Injectable,
} from '@nestjs/common';

import OAuth2Client, { ValidateFunc } from '../classes/OAuth2Client';
import { CodeResponse, OAuth2Options } from '../@types';
import { UserService } from '../user/user.service';
import { Provider } from '../providers/constants';
import { isProduction } from '../utils/app';

export const noClientError = (name: string) =>
  `No client found with name: ${name}`;

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

    const auth = { ...options.credentials.auth };
    delete auth.userInfo;

    const oAuthClient = new OAuth2Client(
      options,
      new AuthorizationCode({
        auth: { ...auth },
        client: { ...options.credentials.client },
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
      throw new Error(noClientError(name));
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
      throw new Error(noClientError(name));
    }

    try {
      const { code, state, scope }: CodeResponse = (request.query ??
        {}) as CodeResponse;
      const userAgent = this.getUserAgent(request);
      const ip = this.getRealIp(request);

      if (!userAgent || !ip || !code || !state || !scope) {
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

      const session = await this.signData(user.uid, userAgent, ip);
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
      const uuid = await this.unsignData(
        request.cookies[this.cookieName],
        this.getUserAgent(request),
        this.getRealIp(request),
      );
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

  private getUserAgent(request: FastifyRequest): string | undefined {
    return request.headers['user-agent'];
  }

  private getRealIp(request: FastifyRequest): string | undefined {
    if (process.env.PROXY_IP) {
      return request.headers['x-real-ip'] as string;
    }

    return request.ip;
  }

  private toUUID(input: string): string {
    return v5(input, process.env.UUID_NAMESPACE);
  }

  private async signData(
    input: string,
    userAgent: string,
    ip: string,
  ): Promise<string> {
    return this.jwtService.signAsync({
      data: [input, this.toUUID(userAgent), this.toUUID(ip)],
    });
  }

  private async unsignData(
    input: string,
    userAgent?: string,
    ip?: string,
  ): Promise<string | null> {
    if (!userAgent || !ip) {
      return null;
    }

    const { data } = (await this.jwtService.verifyAsync(input)) ?? { data: [] };
    const [userId, userAgentFromToken, ipFromToken]: string[] = data ?? [];
    if (!userId || !userAgentFromToken || !ipFromToken) {
      return null;
    }

    if (this.toUUID(userAgent) !== userAgentFromToken) {
      return null;
    }

    if (this.toUUID(ip) !== ipFromToken) {
      return null;
    }

    return userId;
  }
}
