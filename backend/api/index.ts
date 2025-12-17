import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let app: any;

async function createNestServer(expressInstance: express.Express) {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
      { logger: ['error', 'warn', 'log'] } // Add logging
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors();
    await app.init();
    console.log(' Nest Ready');
  }
  return app;
}

// Initialize on cold start
createNestServer(server).catch((err) => console.error(' Nest broken', err));

export default server;