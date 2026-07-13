# Agent Guidelines - Product Manager API Service

Este documento define convenções e padrões específicos para o módulo de serviço de produtos do Manager (`src/services/api-main/product-manager`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
product-manager/
├── product-manager-service-api.ts       # Classe principal (integração direta) + funções de leitura (sem cache)
├── index.ts                         # Exportações públicas
├── types/
│   └── product-manager-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── product-manager-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts              # Entity → DTO (API response → UI models)
```

> **Sem cache**: aplicação admin que exige dados em tempo real. As funções de leitura (`getProductsManager`, `getProductManagerById`, `searchProductsManager`) chamam a API diretamente a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Responsabilidades

### 1. `product-manager-service-api.ts` (Camada de Integração + Leitura)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store)
- **Normaliza** respostas de API (NOT_FOUND/EMPTY_RESULT → SUCCESS com array vazio)
- **Extrai** dados da estrutura de resposta da API (`extractProductsManager`, `extractProductManagerById`, `extractRelatedCategories`, `extractRelatedProducts`, `extractProductsManagerSearch`)
- **Valida** respostas da API (`isValidProductManagerList`, `isValidProductManagerDetail`, `isValidProductManagerSearchList`)
- **Lança** erros específicos (`ProductManagerError`, `ProductManagerNotFoundError`)
- **Exporta** instância singleton `productManagerServiceApi`
- **Fornece** funções de leitura para Server Components (`getProductsManager`, `getProductManagerById`, `searchProductsManager`) **sem cache** — transformam entidades API → DTOs UI via `transformers` e retornam `{ products: UIProductManager[], total: number }` (`getProductsManager`, onde `total` vem de `response.quantity`) / `UIProductManager[]` (`searchProductsManager`) / `{ product, relatedCategories } | undefined` (`getProductManagerById`)
- **Guard check**: retorna `{ products: [], total: 0 }` (`getProductsManager`) ou `undefined` (`getProductManagerById`) se `pe_system_client_id` não for fornecido

### 2. `types/product-manager-types.ts`
- Define interfaces base (`ProductManagerBaseRequest`, `ProductManagerBaseResponse` com `recordId: string`)
- Define interfaces para **requests** (`ProductManagerFindAllRequest`, `ProductManagerFindByIdRequest`, `ProductManagerFindSearchRequest`)
- Define interfaces para **responses** com chaves tipadas nos dados:
  - `ProductManagerFindAllResponse` → `data: { "Product Manager find All": ProductManagerListItem[] }`
  - `ProductManagerFindByIdResponse` → `data: ProductManagerFindByIdData` (3 result sets tipados)
  - `ProductManagerFindSearchResponse` → `data: { "Product Manager find Search": ProductManagerSearchItem[] }`
- Define tipo para **dados tipados do findById** (`ProductManagerFindByIdData`) com 3 result sets
- Define tipos para **entidades** API (`ProductManagerListItem`, `ProductManagerDetail`, `ProductManagerSearchItem`)
- Define tipos para **entidades relacionadas** (`ProductManagerRelatedCategory`, `ProductManagerRelatedProduct`)
- Define classes de erro customizadas (`ProductManagerError`, `ProductManagerNotFoundError`, `ProductManagerValidationError`)

### 3. `validation/product-manager-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`ProductManagerFindAllInput`, `ProductManagerFindByIdInput`, `ProductManagerFindSearchInput`)
- Define constraints específicas da API (max length, min values, int)
- Parâmetros de contexto são `.optional()` nos schemas

### 4. `transformers/transformers.ts`
- Define interface `UIProductManager` para uso no front-end (inclui campos `valueType` e `productValue` específicos do search)
- Define interface `UIProductManagerRelatedCategory` para categorias relacionadas
- Define interface `UIProductManagerRelatedProduct` para produtos relacionados
- **Converte** entidades da API (`ProductManagerListItem`, `ProductManagerDetail`, `ProductManagerSearchItem`) → DTOs UI (`UIProductManager`)
- **Converte** entidades relacionadas (`ProductManagerRelatedCategory`, `ProductManagerRelatedProduct`) → DTOs UI
- **Normaliza** tipos (ex: `IMPORTADO: number` → `imported: boolean`, `PROMOCAO` → `promotion`)
- **Mapeia** campos específicos do search: `TIPO_VALOR` → `valueType`, `VALOR_PRODUTO` → `productValue`, `ID_IMAGEM` → `imageId`, `TEMPODEGARANTIA_MES` → `warrantyMonths`, `TX_PRODUTO_LOJA` → `storeFee`
- **Mapeia** campos fiscais/tributários do detail: `CFOP` → `cfop`, `CST` → `cst`, `EAN` → `ean`, `NCM` → `ncm`, `NBM` → `nbm`, `PPB` → `ppb`, `TEMP` → `temp`
- **Mapeia** campos SEO do detail: `META_TITLE` → `metaTitle`, `META_DESCRIPTION` → `metaDescription`
- **Mapeia** campo de atualização do detail: `DT_UPDATE` → `updatedAt`
- **Handle** campos opcionais/null
- Funções: `transformProductManagerListItem`, `transformProductManagerDetail`, `transformProductManagerSearchItem`, `transformProductManagerList`, `transformProductManagerDetailList`, `transformProductManagerSearchList`, `transformProductManager`, `transformRelatedCategory`, `transformRelatedCategories`, `transformRelatedProduct`, `transformRelatedProducts`

### 5. `index.ts` (Exportações Públicas)
- Exporta `ProductManagerServiceApi` classe e instância singleton
- Exporta todos os tipos de `product-manager-types.ts` (requests, responses, entities, related entities, errors)
- **Nota**: As funções de leitura devem ser importadas diretamente de `product-manager-service-api.ts`

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

**Parâmetros Específicos de Produto do Manager:**
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
    "Product Manager find All": ProductManagerListItem[]
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
    "Product Manager find Id": ProductManagerDetail[],
    "Related Categories": ProductManagerRelatedCategory[],
    "Related Products": ProductManagerRelatedProduct[]
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
    "Product Manager find Search": ProductManagerSearchItem[]
  },
  quantity: number,
  errorId: number,
  info1?: string
}
```

### Endpoints
```typescript
PRODUCT_MANAGER_ENDPOINTS = {
  FIND_ALL: "/product-manager/v2/product-find-manager-all",
  FIND_BY_ID: "/product-manager/v2/product-find-manager-id",
  FIND_SEARCH: "/product-manager/v2/product-find-manager-search",
}
```
