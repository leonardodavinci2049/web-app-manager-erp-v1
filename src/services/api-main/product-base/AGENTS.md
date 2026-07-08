# Agent Guidelines - Product Base API Service

Este documento define convenções e padrões específicos para o módulo de serviço base de produtos (`src/services/api-main/product-base`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa (mesmo padrão do brand):

```
product-base/
├── AGENTS.md                          # Documentação da arquitetura
├── product-base-service-api.ts        # Classe principal (integração direta) + funções de leitura (sem cache)
├── index.ts                           # Exportações públicas
├── types/
│   └── product-base-types.ts          # Interfaces TypeScript
├── validation/
│   └── product-base-schemas.ts        # Schemas Zod
└── transformers/
    └── transformers.ts                # Entity → DTO (API → UIProduct/UIProductDetail)
```

> **Sem cache**: aplicação admin que exige dados em tempo real. As funções de leitura (`getProducts`, `searchProducts`, `getProductById`) chamam a API diretamente a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Endpoints Suportados

| Método                  | Endpoint                              | Tipo    |
|-------------------------|---------------------------------------|---------|
| `findAllProducts()`     | `/product-base/v3/product-find-all`   | Leitura |
| `findProductById()`     | `/product-base/v3/product-find-id`    | Leitura |
| `searchAllProducts()`   | `/product-base/v3/product-search-all` | Leitura |
| `createProduct()`       | `/product-base/v3/product-create`     | Mutação |

## Constantes

```typescript
PRODUCT_BASE_ENDPOINTS = {
  FIND_ALL: "/product-base/v3/product-find-all",
  FIND_BY_ID: "/product-base/v3/product-find-id",
  SEARCH_ALL: "/product-base/v3/product-search-all",
  CREATE: "/product-base/v3/product-create",
}
```

## Resposta do findById

O endpoint `findProductById` retorna múltiplos result sets:
- `"Product find Id"` — Detalhes do produto (`ProductDetail[]`)
- `"Product find Id categories"` — Categorias do produto (`ProductDetailCategory[]`)
- `"Product find Id related"` — Produtos relacionados (`ProductDetailRelated[]`)

## Transformers

- `UIProduct` — DTO para listagens (findAll, searchAll)
- `UIProductDetail` — DTO completo com categorias e relacionados (findById)
- `UIProductCategory` — DTO de categoria do produto
- `UIProductRelated` — DTO de produto relacionado
