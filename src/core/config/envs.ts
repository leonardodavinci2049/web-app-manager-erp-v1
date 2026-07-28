/**
 * Camada de compatibilidade que reexporta as variáveis de ambiente validadas.
 *
 * As validações (schemas Zod) foram separadas por contexto:
 * - `envs.client.ts`: variáveis públicas (NEXT_PUBLIC_*), seguras no cliente.
 * - `envs.server.ts`: variáveis exclusivas do servidor (`import "server-only"`).
 *
 * Este módulo apenas reúne ambos os grupos e mantém o objeto combinado `envs`.
 * Como importa `envs.server`, ele é efetivamente server-only: NÃO o utilize em
 * Client Components — importe `publicEnvs` de `envs.client` nesses casos.
 */
import { type PublicEnvs, publicEnvs, publicEnvsSchema } from "./envs.client";
import { type ServerEnvs, serverEnvs, serverEnvsSchema } from "./envs.server";

export {
  type PublicEnvs,
  publicEnvs,
  publicEnvsSchema,
  type ServerEnvs,
  serverEnvs,
  serverEnvsSchema,
};

/**
 * Objeto legado combinando variáveis públicas e de servidor.
 * Contém segredos: server-only.
 */
export const envs = {
  ...publicEnvs,
  ...serverEnvs,
} as PublicEnvs & ServerEnvs;
