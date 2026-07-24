🔴 MERCURY PROJECT
# Contexto do Agente — Catálogo de Produtos

Este arquivo complementa o `AGENTS.md` da raiz para a página principal do
segmento `src/app/dashboard`, servida em `/dashboard`. Ele deve ser lido antes
de alterar `page.tsx`, `loading.tsx` ou os componentes do catálogo em
`_components/catalog`.

O arquivo `src/app/page.tsx` não implementa o catálogo: a rota `/` apenas
valida a sessão e redireciona o usuário para `/dashboard` ou `/sign-in`.

As demais rotas filhas de `dashboard` não fazem parte da tela de catálogo.
Quando existir um `AGENTS.md` mais próximo, como em `category/` ou
`_components/catalog/`, leia-o também; suas orientações especializam este guia.

## Objetivo da rota

- `page.tsx` é a central de consulta e manutenção rápida do catálogo de
  produtos.
- A página permite pesquisar, ordenar e combinar filtros de produto, categoria,
  marca, tipo, fornecedor, estoque, vendas, conteúdo, origem e situação.
- Os resultados podem ser exibidos em grade ou lista. Em desktop, o modo lista
  usa uma tabela; em telas menores, usa cards compactos.
- Cada produto apresenta imagem, identificação, marca, tipo, informações de
  venda, estoque, preços, categorias e acesso à rota de detalhes.
- Nome, preços, estoque e vínculos com categorias podem ser alterados
  diretamente no catálogo por editores inline.
- Produtos sem uma imagem válida exibem um seletor com clique ou arrastar e
  soltar para enviar a imagem principal.

## Estrutura relacionada

```text
dashboard/
├── AGENTS.md                          # Este guia da rota
├── layout.tsx                         # Organização, sidebar e área de conteúdo
├── page.tsx                           # Server Component, filtros e leituras
├── loading.tsx                        # Estado de carregamento da rota
└── _components/
    ├── app-sidebar/                   # Navegação compartilhada do dashboard
    └── catalog/
        ├── AGENTS.md                  # Convenções internas do catálogo
        ├── index.ts                   # API pública do módulo
        ├── catalog-shell.tsx          # Composição Server da toolbar e resultados
        ├── catalog-loading-products.tsx
        ├── catalog-toolbar/
        │   ├── catalog-toolbar.tsx    # Filtros na URL e preferência de visualização
        │   ├── catalog-search.tsx
        │   ├── catalog-active-filters-panel.tsx
        │   ├── view-mode-toggle.tsx
        │   └── filter-panel/          # Filtros gerais, avançados e flags
        ├── product-grid/
        │   ├── product-grid.tsx       # Grade, lista mobile e estado vazio
        │   ├── load-more-button.tsx
        │   └── product-grid-skeleton.tsx
        ├── product-card/
        │   ├── product-card.tsx       # Card Server nas variantes grade/lista
        │   ├── product-image-section.tsx
        │   └── inline-update/         # Nome, preços, estoque e categorias
        ├── product-table.tsx          # Modo lista em desktop
        ├── product-image-upload.tsx   # Upload quando não há imagem válida
        ├── category-tags.tsx
        ├── product-sales-information.tsx
        ├── lib/
        │   ├── search-params.ts       # Normalização URL ↔ filtros
        │   └── category-helpers.ts    # Taxonomias para opções de filtro
        └── types/
            └── catalog-types.ts       # Tipos locais do catálogo
```

As mutações consumidas pelo catálogo ficam nas Server Actions globais em
`src/app/actions/`: `action-product-updates.ts`,
`action-product-images.ts`, `action-taxonomy.ts` e
`action-categories.ts`.

## Fluxo de dados

1. `page.tsx` chama `connection()`, lê `searchParams` e recupera o contexto
   autenticado por `getAuthContext()`.
2. `parseCatalogSearchParams()` normaliza os filtros e
   `mapSortToApiParams()` converte a ordenação da interface para o contrato da
   API.
3. Produtos, marcas, categorias e tipos são buscados em paralelo por
   `getProductsManager()`, `getBrands()`, `getTaxonomyMenu()` e `getPtypes()`.
4. A taxonomia é convertida em opções planas por `flattenCategories()`,
   preservando ID, pai, nível, ordem e contagem de produtos.
5. Falhas de cada integração são isoladas: a página registra o erro com
   `createLogger()` e usa coleção vazia como fallback para continuar renderizando.
6. `CatalogShell` cria as árvores Server de grade e lista e as entrega à
   `CatalogToolbar`, que escolhe no cliente qual variante exibir.
7. Alterações de filtros usam `router.replace()`, refazem a leitura server-side
   e exibem um estado de transição sobre os resultados.

As leituras dependem da requisição e do contexto da organização. Não adicione
`"use cache"` sem uma chave segura por organização e sem revisar o contrato dos
serviços envolvidos.

## Estado controlado pela URL

`lib/search-params.ts` é a fonte única de verdade para ler e escrever os filtros.
Use `parseCatalogSearchParams()`, `buildCatalogUrl()`,
`buildCatalogReturnTo()` e `buildProductDetailsHref()`; não replique essa lógica
em componentes.

| Parâmetro | Valores | Finalidade |
| --- | --- | --- |
| `search` | texto, até 300 caracteres | Busca por ID, nome, referência ou modelo |
| `category` | inteiro positivo | Categoria selecionada; ausência significa todas |
| `brand` | inteiro positivo | Marca |
| `type` | inteiro positivo | Tipo de produto |
| `supplier` | inteiro positivo | ID do fornecedor |
| `physical` | inteiro positivo | ID do produto físico |
| `ean` | texto, até 200 caracteres | Código EAN |
| `sales-list` | `1`, `2`, `3` | Mais vendidos, menos vendidos ou encalhados |
| `stock-list` | `1`, `2`, `3` | Com estoque, estoque até 2 ou últimos cadastrados |
| `advanced` | `1`, `2` | Atacado menor que 1 ou produto de serviço |
| `various-list` | `1` a `6` | Promoção, destaque, consignado, descontinuado, sem controle de estoque ou site desativado |
| `registration-period` | `1` | Habilita o filtro por período de cadastro |
| `start-date` | `YYYY-MM-DD` | Início do período |
| `end-date` | `YYYY-MM-DD` | Fim do período |
| `no-image` | `1` | Produtos sem imagem |
| `no-description` | `1` | Produtos sem descrição |
| `no-sales-copy` | `1` | Produtos sem descrição de venda |
| `imported` | `1`, `2` | Importados ou nacionais; ausência significa todos |
| `inactive` | `0`, `1`, `2` | Todos, inativos ou ativos; padrão `2` |
| `premium` | `1` | Produtos premium |
| `sort` | `name-asc`, `name-desc`, `newest`, `price-asc`, `price-desc` | Ordenação; padrão `newest` |
| `limit` | inteiro positivo | Quantidade acumulada; padrão `50` |
| `page` | inteiro a partir de zero | Página enviada à API; padrão `0` |

O período padrão é calculado como os sete dias anteriores até o dia seguinte,
mas só é enviado à API quando `registration-period=1` e as datas formam um
intervalo válido.

O modo de visualização não pertence à URL. `CatalogToolbar` guarda `grid` ou
`list` em `localStorage`, na chave `catalog:product-view-mode`. Preserve essa
separação: filtros de dados são compartilháveis pela URL; preferência visual é
estado local do navegador.

## Busca, filtros e paginação

- A pesquisa mantém um buffer local e só altera a URL ao confirmar pelo botão
  ou pela tecla Enter.
- O painel lateral divide os filtros em **Geral**, **Avançado** e **Flags**.
- Filtros ativos são exibidos como badges removíveis, com contagem de produtos
  carregados e total retornado pela API.
- Limpar os filtros do painel preserva a pesquisa principal; limpar tudo também
  remove a pesquisa.
- A paginação visível é incremental: `LoadMoreButton` soma 50 a `limit` e
  preserva os demais parâmetros. A implementação não concatena páginas no
  cliente; ela solicita novamente à API a quantidade acumulada.
- Atualmente, `ProductGrid` considera que pode haver mais resultados quando
  `products.length >= limit`. Preserve essa heurística ou altere o contrato de
  paginação de forma coordenada com o serviço.
- `catalogReturnTo` preserva a query atual nos links para
  `/dashboard/product/[id]`, permitindo voltar ao mesmo estado do catálogo.

## Exibição dos produtos

- O modo grade usa `ProductCard` em layout responsivo.
- O modo lista usa cards compactos em telas menores e `ProductTable` no desktop.
- As primeiras imagens da grade e a primeira imagem das listas recebem
  carregamento antecipado; as demais são lazy-loaded.
- Imagem inválida, vazia ou igual ao placeholder
  `/images/product/no-image.jpeg` abre o fluxo de upload.
- Os produtos podem exibir badges de promoção, novo, importado e sem estoque.
  “Novo” significa criado há menos de sete dias segundo `createdAt`.
- As categorias recebidas como JSON são tratadas defensivamente. JSON ausente
  ou inválido resulta em lista vazia.

## Edições inline e upload

Os editores inline são Client Components pequenos. Eles validam o valor local,
chamam uma Server Action, mostram feedback com `toast`, atualizam o valor
exibido e executam `router.refresh()` após sucesso.

- `InlineNameEditor` chama `updateProductName()`.
- `InlinePriceEditor` chama `updateProductPrice()` e mantém atacado,
  corporativo e varejo no mesmo fluxo.
- `InlineStockEditor` chama `updateProductStock()`; no catálogo, o estoque
  mínimo enviado é `0`.
- `InlineCategoryEditor` carrega os vínculos por
  `fetchProductCategories()` e usa `createTaxonomyRelationship()` e
  `deleteTaxonomyRelationship()` para adicionar ou remover categorias.
- `ProductImageUpload` aceita uma única imagem por vez, limita o arquivo a
  10 MB no cliente e chama `uploadProductImageAction()`. Depois do envio,
  `ProductImageSection` atualiza a rota com `router.refresh()`.

Validação de interface não substitui validação no servidor. Toda Server Action
deve recuperar novamente o contexto autenticado, validar IDs e valores, manter
o isolamento por organização e retornar mensagens seguras. Não exponha
respostas brutas da API nem detalhes internos de erro ao cliente.

## Serviços relacionados

- `product-manager`: listagem, pesquisa, filtros, paginação e DTO principal.
- `product-inline`: alterações pontuais de nome e estoque.
- `product-update`: atualização conjunta de preços.
- `brand` e `ptype`: opções de marca e tipo no painel de filtros.
- `taxonomy-base`: menu hierárquico usado no filtro e no seletor de categoria.
- `taxonomy-rel`: vínculos entre produtos e categorias.
- `api-assets`: upload e resolução das imagens do produto.

Antes de modificar serviços em `src/services/api-main`, leia o `AGENTS.md`
existente no módulo correspondente.

## Convenções para alterações

- Preserve `page.tsx`, `CatalogShell`, `ProductGrid`, `ProductCard` e
  `ProductTable` como Server Components. Restrinja `"use client"` a busca,
  filtros, preferência visual, upload e editores interativos.
- Não envie segredos, contexto autenticado ou entidades desnecessárias aos
  Client Components.
- Ao adicionar ou alterar um filtro, atualize em conjunto
  `CatalogFilters`, `parseCatalogSearchParams()`, `buildCatalogUrl()`, os
  controles do painel, os badges ativos e o mapeamento para
  `getProductsManager()`.
- Ao adicionar uma opção de ordenação, alinhe `SORT_OPTIONS`,
  `VALID_SORT_OPTIONS` e `mapSortToApiParams()`.
- Preserve os demais parâmetros ao alterar somente `limit` ou construir links
  de detalhes.
- Mantenha paridade funcional entre grade, cards compactos e tabela desktop.
- Textos da interface e retornos das ações devem permanecer em português do
  Brasil; nomes de código seguem inglês.
- Use `createLogger()` para erros relevantes. Não introduza novos
  `console.error` em código server-side.
- Evite refatorar as rotas filhas de `dashboard` ao trabalhar exclusivamente no
  catálogo.

## Verificação

- Para alterações TS/React no catálogo, execute `pnpm lint`.
- Para mudanças na rota, Server Actions, carregamento de dados ou integrações,
  execute também `pnpm build` quando viável.
- Para mudanças visuais ou interativas, valide `/dashboard` no navegador em
  desktop e mobile: pesquisa, filtros combinados, remoção de filtros, grade,
  lista, tabela, carregamento incremental, estado vazio, retorno dos detalhes,
  edições inline e upload.
- O projeto não possui testes automatizados no momento; não invente comandos de
  teste.
