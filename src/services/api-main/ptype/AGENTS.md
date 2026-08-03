# Agent Guidelines - Product Type (Ptype) API Service

Este documento define convenções e padrões específicos para o módulo de tipos de produto (`src/services/api-main/ptype`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
ptype/
├── ptype-service-api.ts       # Classe principal (integração direta) + funções de leitura (sem cache)
├── index.ts                   # Exportações públicas
├── types/
│   └── ptype-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── ptype-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts        # Entity → DTO (API response → UI models)
```

> **Sem cache**: aplicação admin que exige dados em tempo real. As funções de leitura (`getPtypes`, `getPtypeById`) chamam a API diretamente a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Responsabilidades

### 1. `ptype-service-api.ts` (Camada de Integração + Leitura)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Métodos de leitura**: `findAllPtypes`, `findManagerAllPtypes`, `findPtypeById`
- **Métodos de mutação**: `createPtype`, `updatePtype`, `deletePtype`
- **Helpers**: `extractPtypes`, `extractPtypeById`
- **Exporta** instância singleton `ptypeServiceApi`
- **Fornece** funções de leitura para Server Components (`getPtypes`, `getPtypesPage`, `getPtypeById`) **sem cache** — transformam entidades API → DTOs UI. `getPtypesPage` usa a listagem manager e retorna `{ items, total }`, derivando o total de `recordId` com fallback defensivo.
- **Guard check**: `getPtypes` retorna `[]` e `getPtypeById` retorna `undefined` se `pe_system_client_id` não for fornecido

### 2. `types/ptype-types.ts`
- Interfaces para requests, responses, entidades da API e classes de erro (`PtypeError`, `PtypeNotFoundError`)

### 3. `validation/ptype-schemas.ts`
- Schemas Zod para todas as operações (find all, find by id, create, update, delete)

### 4. `transformers/transformers.ts`
- `UIPtype` para front-end
- Funções de transformação Entity→DTO (`transformPtype`, `transformPtypeList`)

## Endpoints

| Método | Endpoint | Tipo |
|--------|----------|------|
| `findAllPtypes` | `/ptype/v2/ptype-find-all` | Leitura |
| `findPtypeById` | `/ptype/v2/ptype-find-manager-id` | Leitura |
| `createPtype` | `/ptype/v2/ptype-create` | Mutação |
| `updatePtype` | `/ptype/v2/ptype-update` | Mutação |
| `deletePtype` | `/ptype/v2/ptype-delete` | Mutação |
