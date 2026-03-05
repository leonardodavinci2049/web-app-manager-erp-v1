# Agent Guidelines - Product Base API Service

Este documento define convenções e padrões específicos para o módulo de serviço base de produtos (`src/services/api-main/product-base`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa (mesmo padrão do brand):

```
product-base/
├── AGENTS.md                          # Documentação da arquitetura
├── product-base-service-api.ts        # Classe principal - integração direta com API
├── product-base-cached-service.ts     # Funções com cache para Server Components
├── index.ts                           # Exportações públicas
├── types/
│   └── product-base-types.ts          # Interfaces TypeScript
├── validation/
│   └── product-base-schemas.ts        # Schemas Zod
└── transformers/
    └── transformers.ts                # Entity → DTO (API → UIProduct/UIProductDetail)
```

## Endpoints Suportados

| Método                  | Endpoint                              | Tipo    | Cache   |
|-------------------------|---------------------------------------|---------|---------|
| `findAllProducts()`     | `/product-base/v3/product-find-all`   | Leitura | seconds |
| `findProductById()`     | `/product-base/v3/product-find-id`    | Leitura | hours   |
| `searchAllProducts()`   | `/product-base/v3/product-search-all` | Leitura | seconds |
| `createProduct()`       | `/product-base/v3/product-create`     | Mutação | —       |

## Constantes

```typescript
PRODUCT_BASE_ENDPOINTS = {
  FIND_ALL: "/product-base/v3/product-find-all",
  FIND_BY_ID: "/product-base/v3/product-find-id",
  SEARCH_ALL: "/product-base/v3/product-search-all",
  CREATE: "/product-base/v3/product-create",
}

CACHE_TAGS = {
  productsBase: "products-base",
  productBase: (id: string) => `product-base-${id}`,
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
