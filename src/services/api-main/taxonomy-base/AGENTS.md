# Agent Guidelines - Taxonomy Base API Service

Este documento define convenções e padrões específicos para o módulo de serviço de taxonomias (`src/services/api-main/taxonomy-base`).

## Arquitetura

O módulo segue um padrão de **camadas** (CRUD completo) para integração com API externa:

```
taxonomy-base/
├── taxonomy-base-service-api.ts       # Classe principal (integração direta) + funções de leitura (sem cache)
├── index.ts                           # Exportações públicas
├── types/
│   └── taxonomy-base-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── taxonomy-base-schemas.ts       # Schemas Zod (validação de request)
└── transformers/
    └── transformers.ts                # Entity → DTO (API response → UI models)
```

> **Sem cache**: aplicação admin que exige dados em tempo real. As funções de leitura (`getTaxonomies`, `getTaxonomyById`, `getTaxonomyMenu`) chamam a API diretamente a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Endpoints

| Operação | Path | Tipo |
|----------|------|------|
| findAllTaxonomies | `/taxonomy-base/v3/taxonomy-find-all` | Leitura |
| findTaxonomyById | `/taxonomy-base/v3/taxonomy-find-id` | Leitura |
| findTaxonomyMenu | `/taxonomy-base/v3/taxonomy-find-menu` | Leitura |
| createTaxonomy | `/taxonomy-base/v3/taxonomy-create` | Mutation |
| updateTaxonomy | `/taxonomy-base/v3/taxonomy-update` | Mutation |
| deleteTaxonomy | `/taxonomy-base/v3/taxonomy-delete` | Mutation |
| updateTaxonomyMetadata | `/taxonomy-base/v3/taxonomy-upd-metadata` | Mutation |

## Responsabilidades

### 1. `taxonomy-base-service-api.ts` (Camada de Integração + Leitura)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store, organization, user)
- **Normaliza** respostas (NOT_FOUND/EMPTY_RESULT → SUCCESS com array vazio) para findAll e findMenu
- **Extrai** dados: `extractTaxonomies` (lista), `extractTaxonomyById` (detalhe), `extractTaxonomyMenu` (menu)
- **Valida** respostas: `isValidTaxonomyList`, `isValidTaxonomyDetail`, `isValidTaxonomyMenu`
- **Lança** erros específicos (`TaxonomyBaseError`, `TaxonomyNotFoundError`)
- **Verifica** erros de stored procedures (`checkStoredProcedureError`)
- **Exporta** singleton `taxonomyBaseServiceApi`
- **Fornece** funções de leitura para Server Components (`getTaxonomies`, `getTaxonomyById`, `getTaxonomyMenu`) **sem cache** — transformam entidades → DTOs UI via `transformers`
- **Guard check**: retorna `[]` ou `undefined` se `pe_system_client_id` não for fornecido

### 2. `types/taxonomy-base-types.ts`
- Request interfaces: FindAll (com paginação/filtros), FindById, FindMenu, Create, Update, Delete, UpdateMetadata
- Entities: `TaxonomyListItem` (12 campos), `TaxonomyDetail` (16 campos), `TaxonomyMenuItem` (9 campos)
- Responses: 7 response interfaces
- Erros: `TaxonomyBaseError`, `TaxonomyNotFoundError`, `TaxonomyValidationError`

### 3. `validation/taxonomy-base-schemas.ts`
- 7 Zod schemas (FindAll, FindById, FindMenu, Create, Update, Delete, UpdateMetadata)
- Context params são `.optional()`
- Constraints: `pe_taxonomy_name` max 100, `pe_slug` max 300, `pe_meta_description`/`pe_meta_keywords` max 500

### 4. `transformers/transformers.ts`
- `UITaxonomy`: DTO para lista e detalhe (id, parentId, name, slug, imagePath, level, order, metaTitle, metaDescription, inactive, createdAt, updatedAt)
- `UITaxonomyMenuItem`: DTO para menu (id, parentId, name, slug, imagePath, level, order, productCount)
- Funções: transformTaxonomyListItem, transformTaxonomyList, transformTaxonomyDetail, transformTaxonomyDetailList, transformTaxonomyMenuItem, transformTaxonomyMenuList, transformTaxonomy (polymorphic)

### 5. `index.ts`
- Exporta classe, singleton, todos os types e error classes
- As funções de leitura devem ser importadas diretamente de `taxonomy-base-service-api.ts`

## Data Keys da API
- findAll: `"Taxonomy find All"`
- findById: `"Taxonomy find Id"`
- findMenu: `"Taxonomy find Menu"`
