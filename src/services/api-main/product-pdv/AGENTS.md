# Agent Guidelines - Product PDV API Service

Este documento define convenções e padrões específicos para o módulo de serviço de produtos PDV (`src/services/api-main/product-pdv`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
product-pdv/
├── product-pdv-service-api.ts       # Classe principal (integração direta) + funções de leitura (sem cache)
├── index.ts                         # Exportações públicas
├── types/
│   └── product-pdv-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── product-pdv-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts              # Entity → DTO (API response → UI models)
```

> **Sem cache**: aplicação admin que exige dados em tempo real. As funções de leitura (`getProductsPdv`, `getProductPdvById`, `searchProductsPdv`) chamam a API diretamente a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Responsabilidades

### 1. `product-pdv-service-api.ts` (Camada de Integração + Leitura)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store)
- **Normaliza** respostas de API (NOT_FOUND/EMPTY_RESULT → SUCCESS com array vazio)
- **Extrai** dados da estrutura de resposta da API (`extractProductsPdv`, `extractProductPdvById`, `extractRelatedCategories`, `extractRelatedProducts`, `extractProductsPdvSearch`)
- **Valida** respostas da API (`isValidProductPdvList`, `isValidProductPdvDetail`, `isValidProductPdvSearchList`)
- **Lança** erros específicos (`ProductPdvError`, `ProductPdvNotFoundError`)
- **Exporta** instância singleton `productPdvServiceApi`
- **Fornece** funções de leitura para Server Components (`getProductsPdv`, `getProductPdvById`, `searchProductsPdv`) **sem cache** — transformam entidades API → DTOs UI via `transformers` e retornam `{ products: UIProductPdv[], total: number }` (`getProductsPdv`, onde `total` vem de `response.quantity`) / `UIProductPdv[]` (`searchProductsPdv`) / `{ product, relatedCategories } | undefined` (`getProductPdvById`)
- **Guard check**: retorna `{ products: [], total: 0 }` (`getProductsPdv`) ou `undefined` (`getProductPdvById`) se `pe_system_client_id` não for fornecido

### 2. `types/product-pdv-types.ts`
- Define interfaces base (`ProductPdvBaseRequest`, `ProductPdvBaseResponse` com `recordId: string`)
- Define interfaces para **requests** (`ProductPdvFindAllRequest`, `ProductPdvFindByIdRequest`, `ProductPdvFindSearchRequest`)
- Define interfaces para **responses** com chaves tipadas nos dados:
  - `ProductPdvFindAllResponse` → `data: { "Product Pdv find All": ProductPdvListItem[] }`
  - `ProductPdvFindByIdResponse` → `data: ProductPdvFindByIdData` (3 result sets tipados)
  - `ProductPdvFindSearchResponse` → `data: { "Product Pdv find Search": ProductPdvSearchItem[] }`
- Define tipo para **dados tipados do findById** (`ProductPdvFindByIdData`) com 3 result sets
- Define tipos para **entidades** API (`ProductPdvListItem`, `ProductPdvDetail`, `ProductPdvSearchItem`)
- Define tipos para **entidades relacionadas** (`ProductPdvRelatedCategory`, `ProductPdvRelatedProduct`)
- Define classes de erro customizadas (`ProductPdvError`, `ProductPdvNotFoundError`, `ProductPdvValidationError`)

### 3. `validation/product-pdv-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`ProductPdvFindAllInput`, `ProductPdvFindByIdInput`, `ProductPdvFindSearchInput`)
- Define constraints específicas da API (max length, min values, int)
- Parâmetros de contexto são `.optional()` nos schemas

### 4. `transformers/transformers.ts`
- Define interface `UIProductPdv` para uso no front-end (inclui campos `valueType` e `productValue` específicos do search)
- Define interface `UIProductPdvRelatedCategory` para categorias relacionadas
- Define interface `UIProductPdvRelatedProduct` para produtos relacionados
- **Converte** entidades da API (`ProductPdvListItem`, `ProductPdvDetail`, `ProductPdvSearchItem`) → DTOs UI (`UIProductPdv`)
- **Converte** entidades relacionadas (`ProductPdvRelatedCategory`, `ProductPdvRelatedProduct`) → DTOs UI
- **Normaliza** tipos (ex: `IMPORTADO: number` → `imported: boolean`, `PROMOCAO` → `promotion`)
- **Mapeia** campos específicos do search: `TIPO_VALOR` → `valueType`, `VALOR_PRODUTO` → `productValue`, `ID_IMAGEM` → `imageId`, `TEMPODEGARANTIA_MES` → `warrantyMonths`, `TX_PRODUTO_LOJA` → `storeFee`
- **Mapeia** campos fiscais/tributários do detail: `CFOP` → `cfop`, `CST` → `cst`, `EAN` → `ean`, `NCM` → `ncm`, `NBM` → `nbm`, `PPB` → `ppb`, `TEMP` → `temp`
- **Mapeia** campos SEO do detail: `META_TITLE` → `metaTitle`, `META_DESCRIPTION` → `metaDescription`
- **Mapeia** campo de atualização do detail: `DT_UPDATE` → `updatedAt`
- **Handle** campos opcionais/null
- Funções: `transformProductPdvListItem`, `transformProductPdvDetail`, `transformProductPdvSearchItem`, `transformProductPdvList`, `transformProductPdvDetailList`, `transformProductPdvSearchList`, `transformProductPdv`, `transformRelatedCategory`, `transformRelatedCategories`, `transformRelatedProduct`, `transformRelatedProducts`

### 5. `index.ts` (Exportações Públicas)
- Exporta `ProductPdvServiceApi` classe e instância singleton
- Exporta todos os tipos de `product-pdv-types.ts` (requests, responses, entities, related entities, errors)
- **Nota**: As funções de leitura devem ser importadas diretamente de `product-pdv-service-api.ts`

## Padrões de Código

### Nomes de Parâmetros API
Prefixo `pe_` (parameter):

**Parâmetros de Contexto (opcionais no schema):**
```typescript
pe_system_client_id: number  // ID do cliente do sistema
pe_organization_id: string   // ID da organização (Max 200 chars)
pe_user_id: string           // ID do usuário (Max 200 chars)
pe_user_name: string         // Nome do usuário (Max 200 chars)
pe_user_role: string         // Papel do usuário (Max 200 chars)
pe_person_id: number         // ID da pessoa associada
```

**Parâmetros Específicos de Produto PDV:**
```typescript
pe_search: string            // Termo de busca (Max 300 chars)
pe_taxonomy_id: number       // ID da taxonomia para filtro
pe_type_id: number           // ID do tipo para filtro
pe_brand_id: number          // ID da marca para filtro
pe_flag_stock: number        // Flag de estoque (0 ou 1)
pe_flag_service: number      // Flag de serviço (0 ou 1)
pe_records_quantity: number  // Quantidade de registros por página
pe_page_id: number           // Número da página
pe_column_id: number         // Coluna para ordenação
pe_order_id: number          // Tipo de ordenação (1=ASC, 2=DESC)
pe_product_id: number        // ID do produto
pe_type_business: number     // Tipo de negócio
pe_customer_id: number       // ID do cliente
pe_limit: number             // Limite de registros retornados
```

### Estrutura de Resposta da API
```typescript
// FindAll Response
{
  statusCode: number,
  message: string,
  recordId: string,
  data: {
    "Product Pdv find All": ProductPdvListItem[]
  },
  quantity: number,
  errorId: number,
  info1?: string
}

// FindById Response
{
  statusCode: number,
  message: string,
  recordId: string,
  data: {
    "Product Pdv find Id": ProductPdvDetail[],
    "Related Categories": ProductPdvRelatedCategory[],
    "Related Products": ProductPdvRelatedProduct[]
  },
  quantity: number,
  errorId: number,
  info1?: string
}

// FindSearch Response
{
  statusCode: number,
  message: string,
  recordId: string,
  data: {
    "Product Pdv find Search": ProductPdvSearchItem[]
  },
  quantity: number,
  errorId: number,
  info1?: string
}
```

### Endpoints
```typescript
PRODUCT_PDV_ENDPOINTS = {
  FIND_ALL: "/product-pdv/v2/product-find-pdv-all",
  FIND_BY_ID: "/product-pdv/v2/product-find-pdv-id",
  FIND_SEARCH: "/product-pdv/v2/product-find-pdv-search",
}
```
