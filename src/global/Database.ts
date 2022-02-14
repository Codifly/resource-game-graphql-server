import { createConnection } from 'typeorm';

const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const DATABASE = process.env.DB_DATABASE;
const URL = process.env.DB_URL;
const SSL = process.env.DB_SSL;

const DEV = process.env.NODE_ENV === 'development';

export default async function initializeDB() {
  console.log('URL: ', URL);
  if (URL && URL.length > 0) {
    await createConnection({
      type: 'postgres',
      url: URL,
      ssl: SSL === 'true',
      entities: [DEV ? 'src/**/*.ts' : 'dist/src/**/*.js'],
      migrations: [DEV ? 'migration/**/*.ts' : 'dist/migration/**/*.js'],
      migrationsRun: true,
      logging: false,
    });
    return;
  }
  await createConnection({
    type: 'postgres',
    host: HOST,
    port: Number(PORT),
    username: USERNAME,
    password: PASSWORD,
    database: DATABASE,
    ssl: SSL === 'true',
    entities: [DEV ? 'src/**/*.ts' : 'dist/src/**/*.js'],
    migrations: [DEV ? 'migration/**/*.ts' : 'dist/migration/**/*.js'],
    migrationsRun: true,
    logging: false,
  });
}
