import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedException } from '@nestjs/common';
import { AuthorizationCode } from 'simple-oauth2';

import OAuth2Client, { ValidateFunc } from '../classes/OAuth2Client';
import { CodeResponse, OAuth2Options } from '../@types';
import authConfig from '../../config/auth.config';
import { ValueOf } from '../../utils/types';

class Authenticator {
  private app?: Parameters<FastifyPluginAsync>['0'] = null;
  private clients: OAuth2Client[] = [];

  public initialize(): FastifyPluginAsync {
    return async (fastify) => {
      this.app = fastify;
    };
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

  public redirectToAuth(name: Provider, reply: FastifyReply): true {
    const client = this.clients.find(({ Name }) => Name === name);
    if (!client) {
      throw new Error(`No client found with name: ${name}`);
    }

    reply.redirect(307, client.generateAuthorizationUri());
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

const authenticator = new Authenticator();
export default authenticator;

export const providers = {
  Google: 'google',
} as const;

export type Provider = ValueOf<typeof providers>;
