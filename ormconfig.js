const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || '5432';
const USERNAME = process.env.DB_USERNAME || 'userdev';
const PASSWORD = process.env.DB_PASSWORD || 'passdev';
const DATABASE = process.env.DB_DATABASE || 'game';

const DEV = process.env.NODE_ENV === 'development';

module.exports = {
  type: 'postgres',
  host: HOST,
  port: Number(PORT),
  username: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  entities: [DEV ? 'src/**/*.ts' : 'dist/src/**/*.js'],
  migrations: [DEV ? 'migration/**/*.ts' : 'dist/migration/**/*.js'],
  logging: false,
  cli: {
    migrationsDir: 'dist/migration',
  },
};
