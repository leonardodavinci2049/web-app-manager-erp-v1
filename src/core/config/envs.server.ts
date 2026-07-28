import "server-only";

import { z } from "zod";

/**
 * Schema para variáveis de ambiente exclusivas do servidor.
 * Não devem ser expostas ao cliente.
 */
export const serverEnvsSchema = z.object({
  PORT: z.coerce.number().positive(),
  EXTERNAL_API_MAIN_URL: z.string().url(),
  EXTERNAL_API_ASSETS_URL: z.string().url(),
  APP_ID: z.coerce.number().positive(),
  STORE_ID: z.coerce.number().positive(),
  DATABASE_ADMIN_HOST: z.string().min(1),
  DATABASE_ADMIN_PORT: z.coerce.number().positive(),
  DATABASE_ADMIN_NAME: z.string().min(1),
  DATABASE_ADMIN_USER: z.string().min(1),
  DATABASE_ADMIN_PASSWORD: z.string().min(1),
  // Database Pool Config
  DB_POOL_CONNECTION_LIMIT: z
    .string()
    .default("5")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  DB_POOL_MAX_IDLE: z
    .string()
    .default("2")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().nonnegative()),
  DB_POOL_IDLE_TIMEOUT: z
    .string()
    .default("10000")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  DB_POOL_QUEUE_LIMIT: z
    .string()
    .default("50")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().nonnegative()),
  API_KEY: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_SENDER_NAME: z.string().min(1),
  EMAIL_SENDER_ADDRESS: z.string().email(),
});

/**
 * Validação das variáveis de servidor.
 * A falha aqui impede a inicialização do servidor.
 */
const serverValidation = serverEnvsSchema.safeParse(process.env);

if (!serverValidation.success) {
  const errorMessages = serverValidation.error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join("\n");
  throw new Error(`❌ Invalid server environment variables:\n${errorMessages}`);
}

export type ServerEnvs = z.infer<typeof serverEnvsSchema>;

export const serverEnvs = serverValidation.data;
