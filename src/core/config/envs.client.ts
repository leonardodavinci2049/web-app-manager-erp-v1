import { z } from "zod";

/**
 * Schema para variáveis de ambiente públicas (expostas ao cliente).
 * Estas variáveis precisam do prefixo NEXT_PUBLIC_.
 */
export const publicEnvsSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_EXTERNAL_PATH_IMAGES_URL: z.string().url(),
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
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_SIDEBAR_TITLE: z.string().min(1),
});

/**
 * Validação das variáveis públicas (disponível em servidor e cliente).
 */
const publicValidation = publicEnvsSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_EXTERNAL_PATH_IMAGES_URL:
    process.env.NEXT_PUBLIC_EXTERNAL_PATH_IMAGES_URL,
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
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "",
  NEXT_PUBLIC_SIDEBAR_TITLE: process.env.NEXT_PUBLIC_SIDEBAR_TITLE || "",
});

if (!publicValidation.success && typeof window === "undefined") {
  console.error(
    "❌ Invalid public environment variables:",
    publicValidation.error.format(),
  );
}

export type PublicEnvs = z.infer<typeof publicEnvsSchema>;

export const publicEnvs = publicValidation.success
  ? publicValidation.data
  : ({} as PublicEnvs);
