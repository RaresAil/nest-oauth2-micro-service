import { VersioningType } from '@nestjs/common';
import { fastifyHelmet } from 'fastify-helmet';
import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import path from 'path';
import fs from 'fs';

import './utils/env';

import authenticator from './auth/strategies';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.register(fastifyHelmet);
  await app.register(authenticator.initialize());

  await app.listen(3000);
}
bootstrap();
