import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { ac } from "./statements";

/**
 * ===========================================
 * Role: USER (usuário padrão do sistema com permissões padrão)
 * ===========================================

 */
const user = ac.newRole(userAc.statements);

/**
 * ===========================================
 * Role: SUPERADMIN (administrador da plataforma)
 * ===========================================
 *
 * Administrador da PLATAFORMA com acesso total ao sistema.
 * NÃO opera o WEB APP MANAGER das organizações, apenas GERENCIA a plataforma.
 *
 * Usado por: Você (desenvolvedor/dono do sistema SaaS)
 *
 * Responsabilidades:
 * - Criar e gerenciar organizações (empresas/lojas)
 * - Gerenciar usuários do sistema
 * - Ver métricas globais da plataforma
 * - Suporte técnico (impersonate, ban, etc)
 *
 * Permissões herdadas do admin plugin:
 * - user: create, list, set-role, ban, impersonate, delete, set-password
 * - session: list, revoke, delete
 */
const superAdmin = ac.newRole({
  ...adminAc.statements,

  // ORGANIZAÇÃO: gestão total de todas as organizações
  organization: ["create", "update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],

  // PLATAFORMA: acesso total às funcionalidades de gestão do SaaS
  platform: [
    "view-dashboard",
    "view-all-organizations",
    "view-organization-details",
    "manage-organizations",
    "manage-subscriptions",
    "view-system-logs",
    "view-system-metrics",
    "manage-system-settings",
    "impersonate-organization",
    "send-announcements",
  ],

  // ⚠️ NOTA: SuperAdmin NÃO tem permissões de WEB APP MANAGER (product, order, etc)
  // Ele gerencia a plataforma, não opera as lojas dos clientes.
  // Se precisar acessar dados de uma organização específica,
  // use "impersonate-organization" para entrar como suporte.
});

export { superAdmin, user };
