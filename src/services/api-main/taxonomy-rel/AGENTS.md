# Agent Guidelines - Taxonomy Rel API Service

Este documento define convenções e padrões específicos para o módulo de relações taxonomia-produto (`src/services/api-main/taxonomy-rel`).

## Arquitetura

O módulo segue um padrão **misto** (1 leitura + 2 mutations) para integração com API externa:

```
taxonomy-rel/
├── taxonomy-rel-service-api.ts       # Classe principal - integração direta com API
├── taxonomy-rel-cached-service.ts    # Função com cache para leitura (apenas getProductsByTaxonomy)
├── index.ts                          # Exportações públicas
├── types/
│   └── taxonomy-rel-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── taxonomy-rel-schemas.ts       # Schemas Zod (validação de request)
└── transformers/
    └── transformers.ts               # Entity → DTO (API response → UI models)
```

## Endpoints

| Operação | Path | Tipo |
|----------|------|------|
| findAllProductsByTaxonomy | `/taxonomy-rel/v3/taxonomy-rel-product-find-all` | Leitura |
| createTaxonomyRelation | `/taxonomy-rel/v3/taxonomy-rel-product-create` | Mutation |
| deleteTaxonomyRelation | `/taxonomy-rel/v3/taxonomy-rel-product-delete` | Mutation |

## Responsabilidades

### 1. `taxonomy-rel-service-api.ts` (Camada de Integração)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store)
- **Normaliza** respostas NOT_FOUND/EMPTY_RESULT para leitura
- **Extrai** dados da estrutura de resposta (`extractProducts`)
- **Verifica** erros de stored procedures para mutations (`checkStoredProcedureError`)
- **Exporta** singleton `taxonomyRelServiceApi`

### 2. `taxonomy-rel-cached-service.ts` (Camada de Cache)
- **Fornece** `getProductsByTaxonomy` para Server Components
- **Usa** `cacheLife("seconds")` e `cacheTag` para invalidação
- **Transforma** entidades → DTOs via `transformTaxonomyRelProductList`
- **Guard check**: retorna `[]` se `pe_system_client_id` não fornecido

### 3. `types/taxonomy-rel-types.ts`
- Define interfaces para requests (FindAllProducts, Create, Delete)
- Define entity `TaxonomyRelProductItem` (ID_TAXONOMY, TAXONOMIA, CREATEDAT)
- Define responses com `StoredProcedureResponse` para mutations
- Define classes de erro customizadas

### 4. `validation/taxonomy-rel-schemas.ts`
- 3 schemas Zod: FindAllProducts, Create, Delete
- Context params são `.optional()`
- `pe_record_id` e `pe_taxonomy_id` são `z.number().int().positive()`

### 5. `transformers/transformers.ts`
- Define `UITaxonomyRelProduct` (taxonomyId, name, createdAt)
- Converte `TaxonomyRelProductItem` → `UITaxonomyRelProduct`

### 6. `index.ts`
- Exporta classe, singleton, types e error classes
- Funções de `taxonomy-rel-cached-service.ts` devem ser importadas diretamente

## Cache Tags
- `CACHE_TAGS.taxonomyRelProducts` — tag estática para lista
- `CACHE_TAGS.taxonomyRelProducts(taxonomyId)` — tag dinâmica por taxonomia
