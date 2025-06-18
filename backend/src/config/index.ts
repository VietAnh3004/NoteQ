import * as dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test', 'local', 'staging']),
  PORT: z.coerce.number().default(8080),

  REFRESH_COOKIE_NAME: z.string(),

  JWT_SECRET: z.string(),
  JWT_TIME: z.string(),

  REFRESH_SECRET: z.string(),
  REFRESH_TIME: z.string(),

  MYSQL_URL: z.string(),
  
  FRONTEND_PORT: z.coerce.number().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Config validation error: ${parsed.error.errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`,
  );
}

const envVars = parsed.data;

export const env = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  cookie: {
    refresh: {
      name: envVars.REFRESH_COOKIE_NAME,
    },
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    time: envVars.JWT_TIME,
  },

  refresh: {
    secret: envVars.REFRESH_SECRET,
    time: envVars.REFRESH_TIME,
  },

  mysql: {
    url: envVars.MYSQL_URL,
  },
  
  ui: {
    port: envVars.FRONTEND_PORT
  }
};
