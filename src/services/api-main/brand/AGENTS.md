# Agent Guidelines - Brand API Service

Este documento define convenções e padrões específicos para o módulo de serviço de marcas (`src/services/api-main/brand`).

## Arquitetura

O módulo segue um padrão de **camadas** para integração com API externa:

```
brand/
├── brand-service-api.ts       # Classe principal (integração direta) + funções de leitura (sem cache)
├── index.ts                   # Exportações públicas
├── types/
│   └── brand-types.ts         # Interfaces TypeScript (API response, errors)
├── validation/
│   └── brand-schemas.ts       # Schemas Zod (validação de request/response)
└── transformers/
    └── transformers.ts        # Entity → DTO (API response → UI models)

src/app/brand/_actions/
├── create-brand.ts            # Server Action para criar marca
├── update-brand.ts            # Server Action para atualizar marca
├── delete-brand.ts            # Server Action para excluir marca
└── get-brand.ts               # Server Action para buscar marca
```

> **Sem cache**: este módulo é uma aplicação admin que exige dados em tempo real. As funções de leitura (`getBrands`, `getBrandById`) fazem a chamada direta à API a cada requisição, sem `"use cache"`, `cacheLife` ou `cacheTag`.

## Responsabilidades

### 1. `brand-service-api.ts` (Camada de Integração + Leitura)
- **Extende** `BaseApiService` para comunicação HTTP
- **Valida** todos os parâmetros de entrada com Zod
- **Constrói** payload base com context IDs (app, store, organization, user)
- **Normaliza** respostas de API (NOT_FOUND/EMPTY_RESULT → SUCCESS com array vazio)
- **Extrai** dados da estrutura de resposta da API (`extractBrands`, `extractBrandById`, `extractStoredProcedureResult`)
- **Valida** respostas da API (`isValidBrandList`, `isValidBrandDetail`)
- **Lança** erros específicos (`BrandError`, `BrandNotFoundError`)
- **Verifica** erros de stored procedures (`checkStoredProcedureError`)
- **Exporta** instância singleton `brandServiceApi`
- **Fornece** funções de leitura para Server Components (`getBrands`, `getBrandById`) **sem cache** — transformam entidades API → DTOs UI via `transformers` e retornam `UIBrand[]` / `UIBrand | undefined`
- **Guard check**: `getBrands` retorna `[]` se `pe_system_client_id` não for fornecido; `getBrandById` retorna `undefined` se não for fornecido
- `getBrandById` recebe `id` como 1º parâmetro e um objeto `params` com os campos de contexto da API (`pe_system_client_id`, `pe_organization_id`, `pe_user_id`, `pe_user_name`, `pe_user_role`, `pe_person_id`) como 2º parâmetro
- **Nota**: Operações de escrita (mutations) estão em `src/app/brand/_actions/`

### 2. `types/brand-types.ts`
- Define interfaces base (`BrandBaseRequest`, `BrandBaseResponse`)
- Define interfaces para **requests** (`BrandFindAllRequest`, `BrandFindByIdRequest`, `BrandCreateRequest`, `BrandUpdateRequest`, `BrandDeleteRequest`)
- Define interfaces para **responses** (`BrandFindAllResponse`, `BrandFindByIdResponse`, `BrandCreateResponse`, `BrandUpdateResponse`, `BrandDeleteResponse`)
- Define tipos para **entidades** API (`BrandListItem`, `BrandDetail`, `StoredProcedureResponse`)
- Define classes de erro customizadas (`BrandError`, `BrandNotFoundError`, `BrandValidationError`)

### 3. `validation/brand-schemas.ts`
- **Valida** entrada de dados com Zod
- Exporta tipos inferidos (`BrandCreateInput`, `BrandFindAllInput`, `BrandFindByIdInput`, `BrandUpdateInput`, `BrandDeleteInput`)
- Define constraints específicas da API (max length, min values, int, positive)
- Parâmetros de contexto são `.optional()` nos schemas

### 4. `transformers/transformers.ts`
- Define interface `UIBrand` para uso no front-end
- **Converte** entidades da API (`BrandListItem`, `BrandDetail`) → DTOs UI (`UIBrand`)
- **Normaliza** tipos (ex: `INATIVO: number` → `inactive: boolean`, `ID_MARCA` → `id`, `MARCA` → `name`)
- **Handle** campos opcionais/null
- Funções: `transformBrandListItem`, `transformBrandDetail`, `transformBrandList`, `transformBrandDetailList`, `transformBrand`
- **`transformBrandListItem`**: mapeia `id` (← `ID_MARCA`), `name` (← `MARCA`), `slug` (← `SLUG`), `imagePath` (← `PATH_IMAGEM`), `inactive` (← `INATIVO`), `createdAt` (← `DATADOCADASTRO`); `notes` e `updatedAt` são sempre `undefined` pois a API de lista não retorna esses campos
- **`transformBrandDetail`**: mapeia `name` como `MARCA ?? ""`, `slug` (← `SLUG`), `imagePath` (← `PATH_IMAGEM`), `notes` (← `ANOTACOES`), `inactive` como `INATIVO === 1`, `createdAt` e `updatedAt`

### 5. `index.ts` (Exportações Públicas)
- Exporta `BrandServiceApi` classe
- Exporta todos os tipos de `brand-types.ts` (requests, responses, entities, errors)
- **Nota**: As funções de leitura (`getBrands`, `getBrandById`) devem ser importadas diretamente de `brand-service-api.ts`

### 6. `src/app/brand/_actions/` (Server Actions para Mutations)
- **Fornece** Server Actions co-locadas para operações de escrita (`createBrand`, `updateBrand`, `deleteBrand`)
- **Usa** `"use server"` directive
- **Verifica** autenticação via `auth.api.getSession()` com redirect para `/sign-in` se não autenticado
- **Chama** `brandServiceApi` diretamente para operações de escrita
- **Trata erros** com try-catch e retorna estruturas padronizadas

## Padrões de Código

### Nomes de Parâmetros API
Prefixo `pe_` (parameter):

**Parâmetros de Contexto (opcionais):**
```typescript
pe_organization_id: string  // ID da organização (Max 200 chars) - depende do usuário logado
pe_user_id: string          // ID do usuário (Max 200 chars) - depende do usuário logado
pe_user_name: string        // Nome do usuário (Max 200 chars) - depende do usuário logado
pe_user_role: string        // Papel do usuário (Max 200 chars) - depende do usuário logado
pe_person_id: number        // ID da pessoa associada - depende do usuário logado
```

**Parâmetros Específicos de Marca:**
```typescript
pe_brand_id: number        // ID da marca
pe_brand: string           // Nome da marca
pe_limit: number           // Limite de resultados (default 100)
pe_image_path: string      // Caminho da imagem
pe_notes: string           // Observações
pe_inactive: number        // 0 = ativo, 1 = inativo
```

### Payload Base
Todos os requests incluem contexto por padrão:
```typescript
{
  // Parâmetros fixos (carregados das variáveis de ambiente)
  pe_app_id: envs.APP_ID,
  pe_store_id: envs.STORE_ID,

  // Parâmetro carregado da sessão do usuário (organização ativa)
  // pe_system_client_id: session.session.systemId

  // Parâmetros dinâmicos (dependem do usuário logado)
  // pe_organization_id: string  // Max 200 chars
  // pe_user_id: string          // Max 200 chars
  // pe_user_name: string        // Max 200 chars
  // pe_user_role: string         // Max 200 chars
  // pe_person_id: number

  // ... parâmetros específicos da operação
}
```

### Estrutura de Resposta da API
```typescript
// Base Response
{
  statusCode: number,      // 200, 404, 500, etc.
  message: string,         // Mensagem da API
  recordId: number,        // ID do registro (se aplicável)
  quantity: number,        // Quantidade de itens
  errorId: number,         // ID do erro (se houver)
  info1?: string,          // Info adicional
}

// FindAll/FindById Response
{
  ...BaseResponse,
  data: {
    "Brand find All": [...],  // Array de BrandListItem ou BrandDetail
  }
}

// Create/Update/Delete Response (StoredProcedure)
{
  ...BaseResponse,
  data: [
    {
      sp_return_id: number,  // ID retornado pela SP
      sp_message: string,    // Mensagem da SP
      sp_error_id: number    // ID do erro (0 = sucesso)
    }
  ]
}

// StoredProcedureResponse Type
interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}
```

### Validação com Zod
```typescript
// Importante: usar .parse() para lançar erro de validação
const validatedParams = BrandCreateSchema.parse(params);

// Para queries opcionais: usar .partial().parse()
const validatedParams = BrandFindAllSchema.partial().parse(params);
```

### Tratamento de Erros
```typescript
// BrandServiceApi: lança erros específicos
if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
  throw new BrandNotFoundError(validatedParams);
}

// Funções de leitura (getBrands/getBrandById): propagam erros;
// os consumidores tratam com .catch() e retornam []/undefined
```

### Transformação de Dados
```typescript
// API Entity → UI DTO
export function transformBrand(entity: BrandListItem | BrandDetail): UIBrand | null {
  if (!entity) return null;

  if ("UUID" in entity) {
    return transformBrandDetail(entity); // Detalhe completo
  }

  return transformBrandListItem(entity); // Lista simples
}

// Interface UIBrand (DTO para UI)
export interface UIBrand {
  id: number;              // Mapped from ID_MARCA
  name: string;            // Mapped from MARCA or NOME
  slug?: string;           // Slug (quando disponível)
  imagePath?: string;      // Caminho da imagem
  notes?: string;          // Observações
  inactive: boolean;       // Mapped from INATIVO (number)
  createdAt?: string;      // Mapped from DATADOCADASTRO
  updatedAt?: string;      // Mapped from DT_UPDATE
}
```

## Constantes Utilizadas

```typescript
// Endpoints da API (importado de @/core/constants/api-constants)
BRAND_ENDPOINTS = {
  FIND_ALL: "/brand/find-all",
  FIND_BY_ID: "/brand/find-by-id",
  CREATE: "/brand/create",
  UPDATE: "/brand/update",
  DELETE: "/brand/delete"
}

// Status codes (importado de @/core/constants/api-constants)
API_STATUS_CODES = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  EMPTY_RESULT: 100, // Código específico da API
  // ...
}

// Instância singleton
brandServiceApi = new BrandServiceApi()
```

## Uso em Server Components

```typescript
import { getBrands, getBrandById } from "@/services/api-main/brand/brand-service-api";

async function BrandList() {
  // pe_system_client_id é obrigatório na prática - sem ele retorna []
  const brands = await getBrands({ pe_system_client_id: systemClientId, limit: 50 });
  // brands: UIBrand[]

  // getBrandById: id como 1º param, objeto de contexto como 2º param
  const brand = await getBrandById(1, {
    pe_system_client_id: systemClientId,
    pe_organization_id: organizationId,
    pe_user_id: userId,
    pe_user_name: memberName,
    pe_user_role: memberRole,
    pe_person_id: personId,
  });
  // brand: UIBrand | undefined

  return <ul>{brands.map(b => <li key={b.id}>{b.name}</li>)}</ul>;
}
```

## Uso em Server Actions

```typescript
import { createBrand } from "@/app/brand/_actions/create-brand";
import { updateBrand } from "@/app/brand/_actions/update-brand";
import { deleteBrand } from "@/app/brand/_actions/delete-brand";

// createBrand - Server Action já faz auth
export async function myCreateBrandAction(data: { brand: string, slug: string }): Promise<MutationResult> {
  const result = await createBrand(data);
  return result;
}

// updateBrand - Server Action já faz auth
export async function myUpdateBrandAction(
  brandId: number,
  data: { brand?: string; slug?: string; imagePath?: string; notes?: string; inactive?: number }
): Promise<MutationResult> {
  const result = await updateBrand({
    brandId,
    ...data,
  });
  return result;
}

// deleteBrand - Server Action já faz auth
export async function myDeleteBrandAction(brandId: number): Promise<MutationResult> {
  const result = await deleteBrand(brandId);
  return result;
}
```

**Tipo MutationResult:**
```typescript
interface MutationResult {
  success: boolean;
  data?: number;   // ID retornado pela stored procedure
  error?: string;
}
```

## Métodos de Extração (BrandServiceApi)

```typescript
// Extrai lista de marcas da resposta do findAll
extractBrands(response: BrandFindAllResponse): BrandListItem[]

// Extrai marca única da resposta do findById
extractBrandById(response: BrandFindByIdResponse): BrandDetail | null

// Extrai resultado da stored procedure (create/update/delete)
extractStoredProcedureResult(response: BrandCreateResponse | BrandUpdateResponse | BrandDeleteResponse): StoredProcedureResponse | null

// Valida se a resposta é válida para lista
isValidBrandList(response: BrandFindAllResponse): boolean

// Valida se a resposta é válida para detalhe
isValidBrandDetail(response: BrandFindByIdResponse): boolean
```

## Regras Específicas

1. **Sempre usar `"server-only"`** no topo dos arquivos
2. **Validar com Zod** antes de enviar para API (`.parse()` para obrigatório, `.partial().parse()` para opcional)
3. **Sem cache** — as funções de leitura em `brand-service-api.ts` chamam a API diretamente a cada requisição (dados em tempo real)
4. **Lançar erros específicos** em `brand-service-api.ts` (`BrandError`, `BrandNotFoundError`, `BrandValidationError`)
5. **Transformar entidades** para UI DTOs antes de retornar ao consumidor
6. **Prefixar parâmetros API** com `pe_`
7. **Usar logger** para erros com contexto descritivo (`createLogger("context")`)
8. **Normalizar respostas vazias** (NOT_FOUND/EMPTY_RESULT → SUCCESS + `[]`)
9. **Parâmetros de contexto fixos**: `pe_app_id`, `pe_store_id` (carregados de env via `buildBasePayload`)
10. **Parâmetro de contexto da sessão**: `pe_system_client_id` (tipo `number`, carregado de `session.session.systemId` - campo `system_id` da organização ativa)
11. **Parâmetros de contexto dinâmicos**: `pe_organization_id`, `pe_user_id`, `pe_user_name`, `pe_user_role`, `pe_person_id` (obrigatórios na API, mas `.optional()` nos schemas - devem ser passados pelo usuário logado)
12. **Imports de constantes**: `API_STATUS_CODES`, `BRAND_ENDPOINTS`, `isApiError`, `isApiSuccess` vêm de `@/core/constants/api-constants`
13. **Usar instância singleton** `brandServiceApi` em vez de criar novas instâncias
