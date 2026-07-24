# Contexto do Agente — Categorias

Este arquivo complementa o `AGENTS.md` da raiz para o segmento
`src/app/dashboard/category`. Ele descreve a implementação da rota
`/dashboard/category` e deve ser lido antes de alterar arquivos desta pasta.

## Objetivo da rota

- A página `page.tsx` é a central de administração das categorias de produtos
  (taxonomias).
- O cadastro é hierárquico e limitado a três níveis:
  1. **Família** (`level: 1`): fica na raiz e usa `parentId: 0`.
  2. **Grupo** (`level: 2`): deve pertencer a uma família.
  3. **Subgrupo** (`level: 3`): deve pertencer a um grupo e é o último nível.
- A interface principal combina indicadores, filtros, uma árvore sanfona e um
  painel com os dados da categoria selecionada.
- Ao selecionar um item da árvore, seu ID é salvo em `categoryId` na URL e o
  painel de detalhes é carregado sem transformar `page.tsx` em Client
  Component.
- O usuário pode criar categorias nos três níveis, editar seus dados, alterar
  seu status, mover grupos e subgrupos, excluir categorias elegíveis e
  administrar vínculos diretos com produtos.

## Estrutura da pasta

```text
category/
├── page.tsx                         # Server Component e composição dos dados
├── loading.tsx                      # Skeleton do segmento
├── error.tsx                        # Error boundary com ação de nova tentativa
├── _actions/
│   └── category-actions.ts          # Server Actions de categorias e produtos
├── _components/
│   ├── category-dashboard.tsx       # Layout árvore + painel de conteúdo
│   ├── category-dashboard-header.tsx
│   ├── category-empty-state.tsx
│   ├── category-hierarchy.ts        # Montagem da árvore, detalhe e indicadores
│   ├── category-types.ts            # DTOs e tipos exclusivos desta feature
│   ├── category-constants.ts        # Rótulos e abreviações dos níveis
│   ├── category-level-badge.tsx
│   ├── details/                     # Cabeçalho, abas e formulário de edição
│   ├── dialogs/                     # Criar, mover, excluir e prévia em massa
│   ├── products/                    # Busca, paginação e vínculos de produtos
│   ├── summary/                     # Faixa de indicadores clicáveis
│   └── tree/                        # Filtros, linhas e navegação da árvore
├── _hooks/
│   └── use-category-query-navigation.ts
└── _utils/
    ├── category-filters.ts          # Predicados e filtros dos indicadores
    ├── category-query.ts            # Atualização incremental da query string
    └── category-tree-visibility.ts  # Expansão e linhas visíveis da árvore
```

## Fluxo de dados

1. `page.tsx` chama `connection()`, lê e normaliza `searchParams` e obtém o
   contexto autenticado com `getAuthContext()`.
2. A página busca até 10.000 itens com `getTaxonomyMenuManager()`. Quando existe
   `categoryId`, busca também o registro completo com `getTaxonomyById()`.
3. `buildCategoryTree()` converte as taxonomias em uma árvore, uma lista plana
   e indicadores. Categorias fora dos níveis 1–3 são ignoradas.
4. `buildCategoryDetail()` cria o DTO do painel e seu breadcrumb, protegendo a
   travessia de ancestrais contra ciclos.
5. Os produtos só são consultados por `getTaxonomyProducts()` quando a aba
   `products` está ativa. A paginação usa 50 itens e `productPage` é um índice
   iniciado em zero.
6. `CategoryDashboard` mantém a composição responsiva. No desktop, árvore e
   detalhes aparecem lado a lado; no mobile, a seleção alterna entre as duas
   áreas.

As leituras desta feature são server-side e sem cache. As falhas esperadas de
integração são registradas com `createLogger()` e convertidas em mensagens
seguras em português para a interface.

## Estado controlado pela URL

Use `useCategoryQueryNavigation()` e `buildCategoryQuery()` para preservar os
parâmetros não alterados. Não monte URLs manualmente nos Client Components.

| Parâmetro | Valores aceitos | Finalidade |
| --- | --- | --- |
| `categoryId` | inteiro positivo | Categoria selecionada |
| `search` | texto, até 100 caracteres | Busca por nome ou ID |
| `level` | `1`, `2`, `3` | Filtro por nível |
| `status` | `active`, `inactive` | Filtro por status |
| `withoutProducts` | `1` | Somente categorias sem produtos diretos |
| `issue` | `family-empty`, `group-empty`, `inconsistent` | Filtro de diagnóstico |
| `tab` | `products`; ausência significa detalhes | Aba do painel |
| `productSearch` | texto, até 100 caracteres | Busca entre produtos vinculados |
| `productPage` | inteiro positivo; ausência representa `0` | Página de produtos |

Ao mudar de categoria, busca ou contexto da aba de produtos, limpe
`productPage` quando a página atual puder deixar de ser válida.

## Árvore, filtros e indicadores

- `CategoryTree` é um Client Component porque controla expansão, filtros locais,
  foco por teclado e navegação.
- A árvore suporta expandir/recolher, seleção, setas para cima/baixo,
  direita/esquerda e seleção com Enter ou Espaço.
- Um ancestral continua visível quando algum descendente corresponde ao filtro.
- Busca, status e “sem produtos” são combinados com filtros disparados pelos
  indicadores. Os indicadores também alteram a query string.
- Os filhos são ordenados por `order` e, em caso de empate, por `name`.
- `directProductCount` representa apenas produtos diretamente vinculados à
  categoria; não é uma soma dos descendentes.
- `buildCategoryTree()` sinaliza autorreferência, família com pai, pai ausente,
  níveis incompatíveis, família sem grupos e grupo sem subgrupos.
- Uma categoria órfã cujo `parentId` não existe permanece na lista plana e nos
  indicadores, mas não é anexada às raízes da árvore pela implementação atual.
  Considere esse comportamento ao trabalhar em diagnósticos de inconsistência.

## Painel da categoria

- O cabeçalho exibe breadcrumb navegável, nível, status, ID e a ação de criar o
  próximo nível. Subgrupos não podem receber filhos.
- A aba **Detalhes** edita nome, slug, ordem, metadados SEO e anotações. ID,
  status e categoria pai não são alterados pelo formulário.
- Mudanças de pai devem passar exclusivamente pelo diálogo **Mover categoria**.
- Ativação e inativação ficam na zona de perigo do formulário.
- Exclusão fica bloqueada quando há categorias filhas ou produtos diretamente
  vinculados.
- A aba **Produtos** lista, busca e pagina os vínculos diretos. Ela permite
  vincular um produto pelo ID e remover um vínculo existente.

## Server Actions e invariantes

Todas as mutações ficam em `_actions/category-actions.ts`. Elas validam a
entrada com Zod, recuperam novamente o contexto autenticado, verificam o estado
atual no servidor, chamam os serviços de API e executam
`revalidatePath("/dashboard/category")`.

- `createCategoryAction()`: deriva o nível a partir do pai, gera o slug e impede
  a criação abaixo do nível 3.
- `updateCategoryAction()`: atualiza os campos editáveis e recusa troca de pai;
  essa responsabilidade pertence à ação de movimento.
- `moveCategoryAction()`: mantém famílias na raiz, exige pai do nível
  imediatamente anterior e impede autorreferência e ciclos.
- `toggleCategoryStatusAction()`: consulta o estado atual antes de invertê-lo.
- `deleteCategoryAction()`: recusa categorias com filhos ou produtos diretos.
- `linkProductAction()` e `unlinkProductAction()`: validam categoria, produto e
  existência ou ausência do vínculo antes da mutação.

Não confie apenas nos bloqueios da interface. Preserve essas verificações nas
Server Actions, pois chamadas diretas podem contornar os Client Components.
Nunca exponha respostas brutas, contexto autenticado ou erros internos ao
cliente.

## Serviços relacionados

- `taxonomy-base`: leituras e CRUD completo da taxonomia.
- `taxonomy-inline`: alteração pontual de pai e status.
- `taxonomy-rel`: criação e remoção da relação taxonomia–produto.
- `product-manager`: validação do produto e de suas categorias relacionadas.

Antes de modificar um desses serviços, leia o `AGENTS.md` existente dentro do
respectivo módulo em `src/services/api-main`.

## Recursos ainda não implementados

- O seletor de imagem está desabilitado até a integração com o serviço de
  arquivos. O formulário apenas preserva o `imagePath` existente.
- A aba **Histórico** está visível, mas desabilitada.
- O diálogo de vínculo em massa é somente uma prévia navegável. Ele não busca
  produtos nem executa mutações até existir um endpoint em lote com limite,
  idempotência e retorno parcial.

Não apresente esses fluxos como concluídos e não use dados simulados para fazê-los
parecer funcionais.

## Convenções para alterações

- Preserve `page.tsx` como Server Component e mantenha `"use client"` restrito
  aos componentes com estado, eventos, APIs do navegador ou hooks de navegação.
- Use os DTOs de `category-types.ts`; não envie entidades completas da API aos
  Client Components.
- Mantenha textos da interface e resultados das ações em português do Brasil;
  nomes de código e documentação técnica geral seguem inglês conforme o guia da
  raiz.
- Ao acrescentar campos, alinhe o schema do formulário, o schema da Server
  Action, o DTO de detalhes e o payload do serviço.
- Ao acrescentar filtros, atualize em conjunto a leitura de `searchParams`, os
  tipos, `buildTreePredicate()`, `statFilterToQuery()` quando aplicável e a
  navegação por query string.
- Preserve acessibilidade da árvore (`role="tree"`, `role="treeitem"`,
  atributos ARIA, foco e teclado) e dos diálogos.
- Use `createLogger()` para erros relevantes e mensagens genéricas para o
  usuário.

## Verificação

- Para qualquer alteração TS/React nesta pasta, execute `pnpm lint`.
- Para mudanças em rota, Server Actions, carregamento de dados ou integrações,
  execute também `pnpm build` quando viável.
- Para mudanças visuais ou interativas, valide a rota
  `/dashboard/category` no navegador, incluindo desktop e mobile, filtros,
  navegação por teclado, seleção via URL e estados de carregamento/erro.
- O projeto não possui testes automatizados no momento; não invente comandos de
  teste.
