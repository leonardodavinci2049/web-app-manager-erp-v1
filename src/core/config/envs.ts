import { z } from "zod";

/**
 * Schemas para variáveis de ambiente
 */

// Variáveis que podem ser expostas ao cliente (precisam do prefixo NEXT_PUBLIC_)
const publicEnvsSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_DEVELOPER_NAME: z.string().min(1),
  NEXT_PUBLIC_DEVELOPER_URL: z.string().url(),
  NEXT_PUBLIC_COMPANY_NAME: z.string().min(1),
  NEXT_PUBLIC_COMPANY_PHONE: z.string().min(10).max(20),
  NEXT_PUBLIC_COMPANY_EMAIL: z.string().email(),
  NEXT_PUBLIC_COMPANY_WHATSAPP: z.string().min(10).max(20),
  NEXT_PUBLIC_COMPANY_META_TITLE_MAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_COMPANY_META_TITLE_MAIN is required"),
  NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION: z
    .string()
    .min(1, "NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION is required"),
  NEXT_PUBLIC_COMPANY_META_DESCRIPTION: z
    .string()
    .min(1, "NEXT_PUBLIC_COMPANY_META_DESCRIPTION is required"),
});

// Variáveis exclusivas do servidor
const serverEnvsSchema = z.object({
  PORT: z.coerce.number().positive(),
  EXTERNAL_API_MAIN_URL: z.string().url(),
  EXTERNAL_API_ASSETS_URL: z.string().url(),
  APP_ID: z.coerce.number().positive(),
  STORE_ID: z.coerce.number().positive(),
  DATABASE_URL: z.string().min(1),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().positive(),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
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
 * Validação e exportação
 */

// Validação das variáveis públicas (sempre disponível)
const publicValidation = publicEnvsSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEVELOPER_NAME: process.env.NEXT_PUBLIC_DEVELOPER_NAME,
  NEXT_PUBLIC_DEVELOPER_URL: process.env.NEXT_PUBLIC_DEVELOPER_URL,
  NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME,
  NEXT_PUBLIC_COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE,
  NEXT_PUBLIC_COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL,
  NEXT_PUBLIC_COMPANY_WHATSAPP: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP,
  NEXT_PUBLIC_COMPANY_META_TITLE_MAIN:
    process.env.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN || "",
  NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION:
    process.env.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION || "",
  NEXT_PUBLIC_COMPANY_META_DESCRIPTION:
    process.env.NEXT_PUBLIC_COMPANY_META_DESCRIPTION || "",
});

if (!publicValidation.success && typeof window === "undefined") {
  console.error(
    "❌ Invalid public environment variables:",
    publicValidation.error.format(),
  );
}

export const publicEnvs = publicValidation.success
  ? publicValidation.data
  : ({} as z.infer<typeof publicEnvsSchema>);

// Validação das variáveis de servidor (apenas no servidor)
let serverEnvsData = {} as z.infer<typeof serverEnvsSchema>;

if (typeof window === "undefined") {
  const serverValidation = serverEnvsSchema.safeParse(process.env);

  if (!serverValidation.success) {
    const errorMessages = serverValidation.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid server environment variables:\n${errorMessages}`,
    );
  }

  serverEnvsData = serverValidation.data;
}

export const serverEnvs = serverEnvsData;

/**
 * Mantém compatibilidade com o objeto 'envs' legado
 */
export const envs = {
  ...publicEnvs,
  ...serverEnvs,
};
