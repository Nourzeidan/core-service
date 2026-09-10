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
  NODE_ENV: z.string()
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
    }

}