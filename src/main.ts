import { VersioningType } from '@nestjs/common';
import { fastifyHelmet } from 'fastify-helmet';
import fastifyCookie from 'fastify-cookie';
import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';

import './utils/env';

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
  await app.register(fastifyCookie, {
    secret: process.env.SESSION_SECRET,
  });

  await app.listen(3000);
}
bootstrap();
