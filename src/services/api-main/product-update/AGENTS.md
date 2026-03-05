# Agent Guidelines - Product Update API Service

Este documento define convenções e padrões específicos para o módulo de serviço de atualizações agrupadas de produtos (`src/services/api-main/product-update`).

## Arquitetura

O módulo segue um padrão **simplificado** para atualizações agrupadas de produtos (apenas mutations, sem cache):

```
product-update/
├── AGENTS.md                        # Documentação da arquitetura
├── product-update-service-api.ts    # Classe principal - integração com API
├── index.ts                          # Exportações públicas
├── types/
│   └── product-update-types.ts      # Interfaces TypeScript
└── validation/
    └── product-update-schemas.ts    # Schemas Zod
```

## Responsabilidades

### 1. `product-update-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store, organization, user)
- **Verifica** erros de stored procedures (`checkStoredProcedureError`)
- **Não usa cache** - apenas comunicação direta
- **Não usa transformers** - retorno direto da `StoredProcedureResponse`
- **Exporta** instância singleton `productUpdateServiceApi`

### 2. `types/product-update-types.ts`
- Define interfaces base (`ProductUpdateBaseRequest`, `ProductUpdateBaseResponse`)
- Define interfaces para **requests** de cada operação agrupada
- Define interfaces para **responses** (todas retornam `StoredProcedureResponse`)
- Define tipos para **entidades** (`StoredProcedureResponse`)
- Define classes de erro customizadas (`ProductUpdateError`, `ProductUpdateNotFoundError`, `ProductUpdateValidationError`)

### 3. `validation/product-update-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`ProductUpdateInput` para cada operação)
- Define constraints específicas da API (max length, int, positive)
- Parâmetros de contexto são `.optional()` nos schemas
- Parâmetros específicos de cada operação são `.optional()` (permitindo atualizações parciais)

### 4. `index.ts` (Exportações Públicas)
- Exporta `ProductUpdateServiceApi` classe
- Exporta todos os tipos de `product-update-types.ts` (requests, responses, errors)
- **Nota**: Sem cached service pois são apenas operações de escrita

## Padrões de Código

### Nomes de Parâmetros API
Prefixo `pe_` (parameter):

**Parâmetros de Contexto (opcionais nos schemas, obrigatórios na API):**
```typescript
pe_organization_id: string  // ID da organização (Max 200 chars)
pe_user_id: string          // ID do usuário (Max 200 chars)
pe_user_name: string        // Nome do usuário (Max 200 chars)
pe_user_role: string        // Papel do usuário (Max 200 chars)
pe_person_id: number        // ID da pessoa associada
```

**Parâmetros Específicos de Produto Update:**
```typescript
pe_product_id: number       // ID do produto (obrigatório em todas as operações)

// Características físicas
pe_weight_gr: number        // Peso em gramas
pe_length_mm: number        // Comprimento em milímetros
pe_width_mm: number         // Largura em milímetros
pe_height_mm: number        // Altura em milímetros
pe_diameter_mm: number      // Diâmetro em milímetros
pe_warranty_period_days: number   // Período de garantia em dias
pe_warranty_period_months: number  // Período de garantia em meses

// Flags (indicadores booleanos - 0 ou 1)
pe_inactive_flag: number         // 0 = ativo, 1 = inativo
pe_imported_flag: number         // 0 = não importado, 1 = importado
pe_physical_control_flag: number // 0 = sem controle, 1 = com controle físico
pe_stock_control_flag: number   // 0 = sem controle, 1 = com controle de estoque
pe_featured_flag: number         // 0 = normal, 1 = destaque
pe_promotion_flag: number        // 0 = sem promoção, 1 = em promoção
pe_discontinued_flag: number     // 0 = ativo, 1 = descontinuado
pe_service_flag: number          // 0 = produto, 1 = serviço
pe_website_off_flag: number      // 0 = online, 1 = offline no website

// Informações gerais
pe_product_name: string          // Nome do produto (Max 255 chars)
pe_ref: string                   // Referência do produto (Max 100 chars)
pe_model: string                 // Modelo do produto (Max 100 chars)
pe_label: string                 // Label / Etiqueta (Max 100 chars)
pe_tab_description: string       // Descrição da aba (Max 200 chars)

// Metadados SEO
pe_meta_title: string            // Meta título para SEO (Max 100 chars)
pe_meta_description: string      // Meta descrição para SEO (Max 200 chars)

// Preços
pe_wholesale_price: number       // Preço atacado
pe_corporate_price: number       // Preço corporativo
pe_retail_price: number          // Preço varejo

// Valores fiscais
pe_cfop: string                 // Código Fiscal de Operações (Max 100 chars)
pe_cst: string                  // Código de Situação Tributária (Max 100 chars)
pe_ean: string                  // Código de barras EAN (Max 100 chars)
pe_nbm: string                  // Nomenclatura Brasileira Mercadorias (Max 100 chars)
pe_ncm: number                  // Nomenclatura Comum do Mercosul
pe_ppb: number                  // Processo Produtivo Básico
pe_temp: number                 // Valor temporário
```

### Payload Base
Todos os requests incluem contexto por padrão:
```typescript
{
  // Parâmetros fixos (carregados das variáveis de ambiente)
  pe_app_id: envs.APP_ID,
  pe_store_id: envs.STORE_ID,

  // Parâmetros de contexto (dinâmicos, dependem do usuário logado)
  pe_organization_id: string  // Max 200 chars
  pe_user_id: string          // Max 200 chars
  pe_user_name: string        // Max 200 chars
  pe_user_role: string         // Max 200 chars
  pe_person_id: number

  // ... parâmetros específicos da operação agrupada
}
```

### Estrutura de Resposta da API
Todas as operações retornam o mesmo formato (StoredProcedure):
```typescript
// Base Response
{
  statusCode: number,      // 100200 para sucesso, 100422 para erro
  message: string,         // Mensagem da API
  recordId: number,        // ID do registro (pe_product_id)
  quantity: number,        // Quantidade de itens (1)
  errorId: number,         // ID do erro (0 = sucesso)
  info1?: string,          // Info adicional
}

// StoredProcedureResponse Type
interface StoredProcedureResponse {
  sp_return_id: number;  // ID do produto atualizado
  sp_message: string;    // Mensagem da SP
  sp_error_id: number;   // ID do erro (0 = sucesso)
}
```

### Validação com Zod
```typescript
// Importante: usar .parse() para lançar erro de validação
const validatedParams = UpdateProductCharacteristicsSchema.parse(params);
```

### Tratamento de Erros
```typescript
// ProductUpdateServiceApi: lança erros específicos
// Verifica erros de stored procedures
if (spResponse.sp_error_id !== 0) {
  throw new ProductUpdateError(spResponse.sp_message, "PRODUCT_UPDATE_ERROR", spResponse.sp_error_id);
}
```

## Endpoints Suportados

| Método                            | Endpoint                                        | Parâmetros Agrupados                            |
|-----------------------------------|-------------------------------------------------|-------------------------------------------------|
| `updateProductCharacteristics()`   | `/product-update/v3/product-upd-characteristics` | Dimensões, peso, garantia                       |
| `updateProductFlags()`            | `/product-update/v3/product-upd-flags`          | 8 flags de status do produto                    |
| `updateProductGeneral()`          | `/product-update/v3/product-upd-general`         | Nome, referência, modelo, label, descrição aba  |
| `updateProductMetadata()`         | `/product-update/v3/product-upd-metadata`        | Meta título e meta descrição SEO                |
| `updateProductPrice()`            | `/product-update/v3/product-upd-price`           | Preços atacado, corporativo, varejo             |
| `updateProductTaxValues()`        | `/product-update/v3/product-upd-tax-values`      | CFOP, CST, EAN, NBM, NCM, PPB, temp            |

## Constantes Utilizadas

```typescript
// Endpoints da API (importado de @/core/constants/api-constants)
PRODUCT_UPDATE_ENDPOINTS = {
  UPDATE_CHARACTERISTICS: "/product-update/v3/product-upd-characteristics",
  UPDATE_FLAGS: "/product-update/v3/product-upd-flags",
  UPDATE_GENERAL: "/product-update/v3/product-upd-general",
  UPDATE_METADATA: "/product-update/v3/product-upd-metadata",
  UPDATE_PRICE: "/product-update/v3/product-upd-price",
  UPDATE_TAX_VALUES: "/product-update/v3/product-upd-tax-values"
}

// Status codes (importado de @/core/constants/api-constants)
API_STATUS_CODES = {
  SUCCESS: 100200,
  NOT_FOUND: 100404,
  // ...
}

// Instância singleton
productUpdateServiceApi = new ProductUpdateServiceApi()
```

## Regras Específicas

1. **Sempre usar `"server-only"`** no topo dos arquivos
2. **Validar com Zod** antes de enviar para API (`.parse()`)
3. **Sem cache** - operações de escrita devem sempre ir à API
4. **Sem transformers** - retorno direto da `StoredProcedureResponse`
5. **Lançar erros específicos** em `product-update-service-api.ts`
6. **Prefixar parâmetros API** com `pe_`
7. **Usar logger** para erros com contexto descritivo (`createLogger("context")`)
8. **Verificar erros de SP** com `sp_error_id` na resposta
9. **Parâmetros de contexto fixos**: `pe_app_id`, `pe_store_id` (carregados de env via `buildBasePayload`)
10. **Parâmetros de contexto dinâmicos**: `pe_organization_id`, `pe_user_id`, `pe_user_name`, `pe_user_role`, `pe_person_id` (obrigatórios na API, mas `.optional()` nos schemas - devem ser passados pelo usuário logado)
11. **Imports de constantes**: `API_STATUS_CODES`, `PRODUCT_UPDATE_ENDPOINTS` vêm de `@/core/constants/api-constants`
12. **Usar instância singleton** `productUpdateServiceApi` em vez de criar novas instâncias
13. **Todos os métodos retornam** `StoredProcedureResponse` com `sp_return_id`, `sp_message`, `sp_error_id`
14. **Atualizações parciais**: parâmetros específicos são `.optional()` para permitir atualização de apenas alguns campos de cada grupo
