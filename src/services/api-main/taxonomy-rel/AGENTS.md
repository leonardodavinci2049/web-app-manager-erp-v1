# Agent Guidelines - Taxonomy Rel API Service

Este documento define convenções e padrões específicos para o módulo de relações taxonomia-produto (`src/services/api-main/taxonomy-rel`).

## Arquitetura

O módulo segue um padrão **misto** (1 leitura + 2 mutations) para integração com API externa:

```
taxonomy-rel/
├── taxonomy-rel-service-api.ts       # Classe principal (integração direta) + função de leitura (sem cache)
├── index.ts                          # Exportações públicas
├── types/
│   └── taxonomy-rel-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── taxonomy-rel-schemas.ts       # Schemas Zod (validação de request)
└── transformers/
    └── transformers.ts               # Entity → DTO (API response → UI models)
```

> **Sem cache**: aplicação admin que exige dados em tempo real. A função de leitura (`getProductsByTaxonomy`) chama a API diretamente a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Endpoints

| Operação | Path | Tipo |
|----------|------|------|
| findAllProductsByTaxonomy | `/taxonomy-rel/v3/taxonomy-rel-product-find-all` | Leitura |
| createTaxonomyRelation | `/taxonomy-rel/v3/taxonomy-rel-product-create` | Mutation |
| deleteTaxonomyRelation | `/taxonomy-rel/v3/taxonomy-rel-product-delete` | Mutation |

## Responsabilidades

### 1. `taxonomy-rel-service-api.ts` (Camada de Integração + Leitura)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store)
- **Normaliza** respostas NOT_FOUND/EMPTY_RESULT para leitura
- **Extrai** dados da estrutura de resposta (`extractProducts`)
- **Verifica** erros de stored procedures para mutations (`checkStoredProcedureError`)
- **Exporta** singleton `taxonomyRelServiceApi`
- **Fornece** `getProductsByTaxonomy` para Server Components **sem cache** — transforma entidades → DTOs via `transformTaxonomyRelProductList` (`UITaxonomyRelProduct[]`)
- **Guard check**: retorna `[]` se `pe_system_client_id` não fornecido

### 2. `types/taxonomy-rel-types.ts`
- Define interfaces para requests (FindAllProducts, Create, Delete)
- Define entity `TaxonomyRelProductItem` (ID_TAXONOMY, TAXONOMIA, CREATEDAT)
- Define responses com `StoredProcedureResponse` para mutations
- Define classes de erro customizadas

### 3. `validation/taxonomy-rel-schemas.ts`
- 3 schemas Zod: FindAllProducts, Create, Delete
- Context params são `.optional()`
- `pe_record_id` e `pe_taxonomy_id` são `z.number().int().positive()`

### 4. `transformers/transformers.ts`
- Define `UITaxonomyRelProduct` (taxonomyId, name, createdAt)
- Converte `TaxonomyRelProductItem` → `UITaxonomyRelProduct`

### 5. `index.ts`
- Exporta classe, singleton, types e error classes
- A função de leitura (`getProductsByTaxonomy`) deve ser importada diretamente de `taxonomy-rel-service-api.ts`
