import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let server: any;

async function bootstrap() {
  const app = express();

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(app),
  );

  await nestApp.init();
  return serverlessExpress({ app });
}

export default async function handler(req: any, res: any) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}
