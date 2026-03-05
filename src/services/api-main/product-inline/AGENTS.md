# Agent Guidelines - Product Inline API Service

Este documento define convenções e padrões específicos para o módulo de serviço de atualizações inline de produtos (`src/services/api-main/product-inline`).

## Arquitetura

O módulo segue um padrão **simplificado** para atualizações inline de produtos (apenas mutations, sem cache):

```
product-inline/
├── AGENTS.md                        # Documentação da arquitetura
├── product-inline-service-api.ts    # Classe principal - integração com API
├── index.ts                          # Exportações públicas
├── types/
│   └── product-inline-types.ts      # Interfaces TypeScript
└── validation/
    └── product-inline-schemas.ts    # Schemas Zod
```

## Responsabilidades

### 1. `product-inline-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store, organization, user)
- **Verifica** erros de stored procedures (`checkStoredProcedureError`)
- **Não usa cache** - apenas comunicação direta
- **Não usa transformers** - retorno direto da `StoredProcedureResponse`
- **Exporta** instância singleton `productInlineServiceApi`

### 2. `types/product-inline-types.ts`
- Define interfaces base (`ProductInlineBaseRequest`, `ProductInlineBaseResponse`)
- Define interfaces para **requests** de cada operação inline
- Define interfaces para **responses** (todas retornam `StoredProcedureResponse`)
- Define tipos para **entidades** (`StoredProcedureResponse`)
- Define classes de erro customizadas (`ProductInlineError`, `ProductInlineNotFoundError`, `ProductInlineValidationError`)

### 3. `validation/product-inline-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`ProductInlineInput` para cada operação)
- Define constraints específicas da API (max length, int, positive)
- Parâmetros de contexto são `.optional()` nos schemas

### 4. `index.ts` (Exportações Públicas)
- Exporta `ProductInlineServiceApi` classe
- Exporta todos os tipos de `product-inline-types.ts` (requests, responses, errors)
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

**Parâmetros Específicos de Produto Inline:**
```typescript
pe_product_id: number       // ID do produto (obrigatório em todas as operações)
pe_brand_id: number         // ID da marca
pe_product_description: string  // Descrição do produto
pe_product_name: string     // Nome do produto (Max 300 chars)
pe_path_imagem: string      // Caminho da imagem (Max 300 chars)
pe_descricao_curta: string  // Descrição curta (Max 300 chars)
pe_stock_min: number        // Estoque mínimo
pe_stock: number            // Estoque atual
pe_type_id: number          // ID do tipo
pe_termo: string            // Termo (Max 300 chars)
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

  // ... parâmetros específicos da operação inline
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
const validatedParams = UpdateProductBrandInlineSchema.parse(params);
```

### Tratamento de Erros
```typescript
// ProductInlineServiceApi: lança erros específicos
// Verifica erros de stored procedures
if (spResponse.sp_error_id !== 0) {
  throw new ProductInlineError(spResponse.sp_message, "PRODUCT_INLINE_ERROR", spResponse.sp_error_id);
}
```

## Endpoints Suportados

| Método                              | Endpoint                                          | Parâmetro Específico          |
|-------------------------------------|---------------------------------------------------|--------------------------------|
| `updateProductBrandInline()`        | `/product-inline/v3/product-upd-inl-brand`       | `pe_brand_id`                  |
| `updateProductDescriptionInline()`  | `/product-inline/v3/product-upd-inl-description` | `pe_product_description`       |
| `updateProductNameInline()`         | `/product-inline/v3/product-upd-inl-name`         | `pe_product_name` (max 300)    |
| `updateProductImagePathInline()`    | `/product-inline/v3/product-upd-inl-path-image`   | `pe_path_imagem` (max 300)     |
| `updateProductShortDescriptionInline()` | `/product-inline/v3/product-upd-inl-short-description` | `pe_descricao_curta` (max 300) |
| `updateProductStockMinInline()`     | `/product-inline/v3/product-upd-inl-stock-min`    | `pe_stock_min`                 |
| `updateProductStockInline()`        | `/product-inline/v3/product-upd-inl-stock`        | `pe_stock`                     |
| `updateProductTypeInline()`         | `/product-inline/v3/product-upd-inl-type`         | `pe_type_id`                   |
| `updateProductVariousInline()`      | `/product-inline/v3/product-upd-inl-variou`       | `pe_termo` (max 300)           |

## Constantes Utilizadas

```typescript
// Endpoints da API (importado de @/core/constants/api-constants)
PRODUCT_INLINE_ENDPOINTS = {
  UPDATE_BRAND: "/product-inline/v3/product-upd-inl-brand",
  UPDATE_DESCRIPTION: "/product-inline/v3/product-upd-inl-description",
  UPDATE_NAME: "/product-inline/v3/product-upd-inl-name",
  UPDATE_IMAGE_PATH: "/product-inline/v3/product-upd-inl-path-image",
  UPDATE_SHORT_DESCRIPTION: "/product-inline/v3/product-upd-inl-short-description",
  UPDATE_STOCK_MIN: "/product-inline/v3/product-upd-inl-stock-min",
  UPDATE_STOCK: "/product-inline/v3/product-upd-inl-stock",
  UPDATE_TYPE: "/product-inline/v3/product-upd-inl-type",
  UPDATE_VARIOUS: "/product-inline/v3/product-upd-inl-variou"
}

// Status codes (importado de @/core/constants/api-constants)
API_STATUS_CODES = {
  SUCCESS: 100200,
  NOT_FOUND: 100404,
  // ...
}

// Instância singleton
productInlineServiceApi = new ProductInlineServiceApi()
```

## Regras Específicas

1. **Sempre usar `"server-only"`** no topo dos arquivos
2. **Validar com Zod** antes de enviar para API (`.parse()`)
3. **Sem cache** - operações de escrita devem sempre ir à API
4. **Sem transformers** - retorno direto da `StoredProcedureResponse`
5. **Lançar erros específicos** em `product-inline-service-api.ts`
6. **Prefixar parâmetros API** com `pe_`
7. **Usar logger** para erros com contexto descritivo (`createLogger("context")`)
8. **Verificar erros de SP** com `sp_error_id` na resposta
9. **Parâmetros de contexto fixos**: `pe_app_id`, `pe_store_id` (carregados de env via `buildBasePayload`)
10. **Parâmetros de contexto dinâmicos**: `pe_organization_id`, `pe_user_id`, `pe_user_name`, `pe_user_role`, `pe_person_id` (obrigatórios na API, mas `.optional()` nos schemas - devem ser passados pelo usuário logado)
11. **Imports de constantes**: `API_STATUS_CODES`, `PRODUCT_INLINE_ENDPOINTS` vêm de `@/core/constants/api-constants`
12. **Usar instância singleton** `productInlineServiceApi` em vez de criar novas instâncias
13. **Todos os métodos retornam** `StoredProcedureResponse` com `sp_return_id`, `sp_message`, `sp_error_id`
