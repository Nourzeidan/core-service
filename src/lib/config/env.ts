// import function esmaha config mn el library dotenv
import {config} from "dotenv";
import path from "path/win32";
import {z} from "zod";

config({path: path.resolve(import.meta.dirname, '../../../.env')}); // Load environment variables from .env file

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("postgres"),
  DB_MIGRATION_DIR: z.string(),
  DB_MIGRATION_EXTENSION: z.string(),
  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),
  ACCESS_EXPIRES_IN: z.string(),
  REFRESH_EXPIRES_IN: z.string(),
  NODE_ENV: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().default(""),
  MAILJET_API_KEY: z.string(),
  MAILJET_SECRET_KEY: z.string(),
  MAILJET_FROM_EMAIL: z.string(),
  MAILJET_FROM_NAME: z.string(),

  // shared secret order-service sends in the `api-key` header on every /api/internal/* call.
  // empty = internal API is closed (requireInternalApiKey answers 503), so the server can still boot without it
  INTERNAL_API_KEY: z.string().default(""),

  // RabbitMQ: only the outbox worker (src/worker.ts) connects, the http server never publishes directly
  RABBITMQ_URL: z.string().default("amqp://guest:guest@localhost:5672"),
  // topic exchange order-service binds its queue to (must match order-service RABBITMQ_CORE_EVENTS_EXCHANGE)
  RABBITMQ_CORE_EVENTS_EXCHANGE: z.string().default("core.events"),
  // croner pattern with seconds: "* * * * * *" = drain the outbox every second
  OUTBOX_DRAIN_CRON: z.string().default("* * * * * *"),
  // max outbox rows published per drain pass
  OUTBOX_BATCH_SIZE: z.string().default("50")
});

const parsed = envSchema.parse(process.env);

export const env = {
     port: Number(parsed.PORT),
    app: {
        nodeEnv: parsed.NODE_ENV,
    },
    db: {
        host: parsed.DB_HOST,
        port: Number(parsed.DB_PORT),
        user: parsed.DB_USER,
        password: parsed.DB_PASSWORD,
        name: parsed.DB_NAME,
        migrationDir: path.resolve(import.meta.dirname, "../../../", parsed.DB_MIGRATION_DIR),
        migrationExtension: parsed.DB_MIGRATION_EXTENSION,
        nodeEnvironment: parsed.NODE_ENV
        // poolMax: Number(parsed.POOL_MAX),
        // poolMin: Number(parsed.POOL_MIN),
        // poolIdleTimeoutMillis: Number(parsed.POOL_IDLE_TIMEOUT_MILLIS)
    }  , 

    jwt: {
        accessSecret: parsed.ACCESS_SECRET,
        refreshSecret: parsed.REFRESH_SECRET,
        accessExpiresIn: parsed.ACCESS_EXPIRES_IN,
        refreshExpiresIn: parsed.REFRESH_EXPIRES_IN
    },
    isProduction: process.env.NODE_ENV === "production",
    cors: {
        origin: parsed.CORS_ORIGINS.split(','),
    },
    redis: {
        host: parsed.REDIS_HOST,
        port: Number(parsed.REDIS_PORT),
        password: parsed.REDIS_PASSWORD,
    },
    email: {
        mailjet: {
            apiKey: parsed.MAILJET_API_KEY,
            secretKey: parsed.MAILJET_SECRET_KEY,
            fromEmail: parsed.MAILJET_FROM_EMAIL,
            fromName: parsed.MAILJET_FROM_NAME
        }
    },
    internal: {
        apiKey: parsed.INTERNAL_API_KEY,
    },
    rabbit: {
        url: parsed.RABBITMQ_URL,
        exchange: parsed.RABBITMQ_CORE_EVENTS_EXCHANGE,
        drainCron: parsed.OUTBOX_DRAIN_CRON,
        batchSize: Number(parsed.OUTBOX_BATCH_SIZE),
    }
}