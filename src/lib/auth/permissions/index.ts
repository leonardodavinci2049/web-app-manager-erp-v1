/**
 * Sistema de Permissões - Better Auth
 *
 * Este módulo exporta todas as configurações de controle de acesso
 * para os plugins organization e admin do Better Auth.
 *
 * Roles de Organização (WEB APP MANAGER):
 * - owner: Proprietário da loja (todas as permissões)
 * - manager: Gerente da loja (configurações, usuários, cadastros)
 * - salesperson: Vendedores (clientes, pedidos)
 * - operator: Operadores (produtos, estoque, preços)
 * - cashier: Caixas (receber pagamentos)
 * - finance: Financeiro (contas a pagar/receber)
 * - shipping: Expedição (entregas)
 * - customer: Clientes da loja (carrinho, orçamentos)
 *
 * Roles de Plataforma (Admin):
 * - superAdmin: Administrador da plataforma
 * - user: Usuário padrão do sistema
 *
 * @example
 * // Server-side (auth.ts)
 * import { ac, owner, manager, salesperson, operator, cashier, finance, shipping, customer, superAdmin, user } from "./permissions"
 *
 * // Client-side (auth-client.ts)
 * import { ac, owner, manager, salesperson, operator, cashier, finance, shipping, customer, superAdmin, user } from "./permissions"
 */

// Admin Roles
export { superAdmin, user } from "./admin-roles";
// Organization Roles
export {
  cashier,
  customer,
  finance,
  manager,
  operator,
  owner,
  salesperson,
  shipping,
} from "./organization-roles";
export type { Action, Resource, Statement } from "./statements";
// Access Controller e Statements
export { ac, statement } from "./statements";
