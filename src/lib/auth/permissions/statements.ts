import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as adminDefaultStatements } from "better-auth/plugins/admin/access";
import { defaultStatements as orgDefaultStatements } from "better-auth/plugins/organization/access";

/**
 * Statement de permissões combinando:
 * - defaultStatements do admin plugin (user, session)
 * - defaultStatements do organization plugin (organization, member, invitation)
 * - permissões da plataforma (platform)
 * - permissões do PDV (product, order, customer, report, cashier, etc)
 *
 * Roles disponíveis na organização:
 * - owner: Proprietário da loja (todas as permissões)
 * - manager: Gerente da loja (configurações, usuários, cadastros)
 * - salesperson: Vendedores (clientes, pedidos)
 * - operator: Operadores (produtos, estoque, preços)
 * - cashier: Caixas (receber pagamentos)
 * - finance: Financeiro (contas a pagar/receber)
 * - shipping: Expedição (entregas)
 * - customer: Clientes da loja (carrinho, orçamentos)
 */
const statement = {
  ...adminDefaultStatements,
  ...orgDefaultStatements,

  // Extendendo organization com ação "create" para permitir criação de organizações
  organization: ["create", "update", "delete"] as const,

  // ==========================================
  // NÍVEL PLATAFORMA (SuperAdmin)
  // Permissões para gestão do sistema multi-tenant
  // ==========================================
  platform: [
    "view-dashboard", // Dashboard administrativo da plataforma
    "view-all-organizations", // Listar todas as organizações
    "view-organization-details", // Ver detalhes de qualquer organização
    "manage-organizations", // Criar, suspender, reativar organizações
    "manage-subscriptions", // Gerenciar planos/assinaturas
    "view-system-logs", // Ver logs do sistema
    "view-system-metrics", // Ver métricas globais (receita, usuários, etc)
    "manage-system-settings", // Configurações globais do sistema
    "impersonate-organization", // Acessar organização como suporte
    "send-announcements", // Enviar comunicados para organizações
  ],

  // ==========================================
  // NÍVEL ORGANIZAÇÃO (PDV)
  // Permissões para operação dentro de uma organização/loja
  // ==========================================

  // MÓDULO: PRODUTOS
  product: [
    "view", // Visualizar lista de produtos
    "view-cost", // Visualizar preço de custo (sensível)
    "create", // Cadastrar novo produto
    "update", // Atualizar dados do produto (nome, descrição, etc)
    "update-price", // Alterar preço de venda
    "update-stock", // Ajustar estoque manualmente
    "delete", // Excluir produto
    "import", // Importar produtos em lote
    "export", // Exportar lista de produtos
  ],

  // MÓDULO: CATEGORIAS DE PRODUTOS
  category: [
    "view", // Visualizar categorias
    "create", // Criar categoria
    "update", // Atualizar categoria
    "delete", // Excluir categoria
  ],

  // MÓDULO: VENDAS / PEDIDOS
  order: [
    "view", // Visualizar seus pedidos
    "view-all", // Visualizar pedidos de todos os vendedores
    "create", // Criar nova venda/pedido
    "update", // Atualizar pedido (antes de finalizar)
    "update-status", // Alterar status do pedido (em preparo, pronto, entregue)
    "cancel", // Cancelar pedido
    "apply-discount", // Aplicar desconto no pedido (com limite)
    "apply-discount-unlimited", // Aplicar desconto sem limite
    "reopen", // Reabrir pedido cancelado/fechado
    "print", // Imprimir comprovante
  ],

  // MÓDULO: CLIENTES
  customer: [
    "view", // Visualizar lista de clientes
    "view-details", // Ver detalhes e histórico do cliente
    "create", // Cadastrar novo cliente
    "update", // Atualizar dados do cliente
    "delete", // Excluir cliente
    "view-credit", // Visualizar crédito/débito do cliente
    "manage-credit", // Gerenciar crédito do cliente
    "export", // Exportar lista de clientes
  ],

  // MÓDULO: RELATÓRIOS
  report: [
    "view-sales", // Relatório de vendas próprias
    "view-sales-all", // Relatório de vendas de todos os vendedores
    "view-products", // Relatório de produtos
    "view-stock", // Relatório de estoque
    "view-customers", // Relatório de clientes
    "view-financial", // Relatório financeiro (sensível)
    "view-commission", // Relatório de comissões
    "view-shipping", // Relatório de entregas/expedição
    "export", // Exportar relatórios
  ],

  // MÓDULO: CAIXA
  cashier: [
    "view", // Visualizar caixa
    "open", // Abrir caixa
    "close", // Fechar caixa
    "withdraw", // Sangria (retirada)
    "deposit", // Suprimento (entrada)
    "view-history", // Histórico de movimentações
    "receive-payment", // Receber pagamento de clientes
    "process-refund", // Processar estorno/devolução
  ],

  // MÓDULO: PAGAMENTOS / FORMAS DE PAGAMENTO
  payment: [
    "view", // Visualizar formas de pagamento
    "create", // Criar forma de pagamento
    "update", // Atualizar forma de pagamento
    "delete", // Excluir forma de pagamento
  ],

  // MÓDULO: ESTOQUE
  stock: [
    "view", // Visualizar estoque
    "view-details", // Ver movimentações de estoque
    "entry", // Dar entrada de mercadorias
    "exit", // Dar baixa no estoque
    "adjust", // Ajustar estoque (inventário)
    "transfer", // Transferir entre depósitos
    "view-cost", // Ver custo médio
  ],

  // MÓDULO: FINANCEIRO
  finance: [
    "view-accounts-payable", // Visualizar contas a pagar
    "view-accounts-receivable", // Visualizar contas a receber
    "create-payable", // Criar conta a pagar
    "create-receivable", // Criar conta a receber
    "pay-account", // Pagar conta
    "receive-account", // Receber conta
    "view-cash-flow", // Ver fluxo de caixa
    "view-bank-accounts", // Ver contas bancárias
    "manage-bank-accounts", // Gerenciar contas bancárias
    "reconcile", // Fazer conciliação bancária
  ],

  // MÓDULO: EXPEDIÇÃO / ENTREGAS
  shipping: [
    "view-orders", // Ver pedidos para entrega
    "assign-delivery", // Atribuir entrega a entregador
    "start-delivery", // Iniciar entrega
    "complete-delivery", // Confirmar entrega realizada
    "return-delivery", // Registrar devolução
    "view-routes", // Ver rotas de entrega
    "manage-routes", // Gerenciar rotas
    "view-delivery-history", // Ver histórico de entregas
  ],

  // MÓDULO: CARRINHO / ORÇAMENTOS (para clientes)
  cart: [
    "view", // Ver seu carrinho
    "create", // Criar carrinho
    "update", // Atualizar carrinho
    "delete", // Limpar carrinho
    "checkout", // Finalizar compra
  ],

  quote: [
    "view", // Ver orçamentos
    "create", // Criar orçamento
    "update", // Atualizar orçamento
    "delete", // Excluir orçamento
    "convert-to-order", // Converter orçamento em pedido
    "print", // Imprimir orçamento
    "send", // Enviar orçamento por email/whatsapp
  ],

  // MÓDULO: CONFIGURAÇÕES DA LOJA
  settings: [
    "view", // Visualizar configurações
    "update", // Atualizar configurações
    "manage-users", // Gerenciar usuários da loja
    "manage-integrations", // Gerenciar integrações (NF-e, TEF, etc)
    "manage-payment-methods", // Gerenciar formas de pagamento
    "manage-tax", // Gerenciar configurações fiscais
  ],
} as const;

/**
 * Access Controller configurado com todos os statements
 */
const ac = createAccessControl(statement);

/**
 * Tipos exportados para type safety em toda a aplicação
 */
type Statement = typeof statement;
type Resource = keyof Statement;
type Action<R extends Resource> = Statement[R][number];

export type { Action, Resource, Statement };
export { ac, statement };
