import 'reflect-metadata';

import dotenv from 'dotenv';
dotenv.config();

import cors from '@koa/cors';
import koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaJson from 'koa-json';
import koaLogger from 'koa-logger';
import koaRouter from 'koa-router';

import initializeCronJobs from './global/CronJobs';
import initializeDB from './global/Database';
import initializeApollo from './global/GraphQL';

const PORT = process.env.PORT || 3000;

async function main() {
  const app = new koa();
  const router = new koaRouter();

  app.use(cors());
  app.use(koaBody());

  await initializeDB();
  const server = await initializeApollo(router);
  await initializeCronJobs();

  router.get('/', async (ctx, next) => {
    ctx.body = {
      status: 'online',
    };
    await next();
  });

  app.use(koaJson());
  app.use(koaLogger());

  // Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  const httpServer = app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
  });
  server.installSubscriptionHandlers(httpServer);
}

main().catch((error) => {
  console.log('Something went wrong, Error:', error);
});
