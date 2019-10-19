import { ConnectionOptions } from "typeorm";

require('dotenv').config({path: 'env.development'});

const {
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_NAME,
  POSTGRES_DISABLE_SSL
} = process.env;

if (!POSTGRES_USERNAME || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_PORT || !POSTGRES_NAME) {
  throw new Error("Missing database config!");
}

export const postgres: ConnectionOptions = {
  type: "postgres",
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  database: POSTGRES_NAME,
  ssl: POSTGRES_DISABLE_SSL ? false : true,
  synchronize: true,
  logging: false,
  entities: [`${__dirname}/src/entities/**/*.js`, "src/entities/**/*.ts"],
  migrations: [`${__dirname}/src/migrations/**/*.js`, "src/migrations/**/*.ts"],
  subscribers: [
    `${__dirname}/src/subscribers/**/*.js`,
    "src/subscribers/**/*.ts"
  ],
  cli: {
    entitiesDir: `${__dirname}/src/entities`,
    migrationsDir: `${__dirname}/src/migrations`,
    subscribersDir: `${__dirname}/src/subscribers`
  },
  migrationsRun: true
};

export default postgres;
