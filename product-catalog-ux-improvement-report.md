# Relatório de melhorias de experiência do usuário — Catálogo de produtos

**Projeto:** Manager ERP  
**Rota analisada:** `/dashboard`  
**Data da análise:** 10 de julho de 2026  
**Escopo:** experiência de consulta e manutenção da lista de produtos; este documento não propõe alterações de código prontas para execução.

## 1. Resumo executivo

O catálogo atual já supera uma listagem administrativa básica. Ele é responsivo, oferece busca, filtros persistidos na URL, visualizações em grade e lista, hierarquia de categorias, carregamento incremental, upload de imagem e edição inline de nome, preços, estoque e categorias. A experiência é particularmente boa para localizar e corrigir um produto por vez.

O principal espaço de evolução não está em adicionar mais elementos aos cartões. Está em transformar a tela em uma **central de operação do catálogo**, capaz de responder rapidamente a perguntas como:

- Quais produtos exigem atenção hoje?
- Quais itens estão sem imagem, sem categoria, sem estoque ou com dados inconsistentes?
- Quais alterações podem ser aplicadas com segurança a dezenas ou centenas de produtos?
- Quais produtos não foram publicados ou sincronizados corretamente com os canais de venda?
- O que mudou, quem alterou e como desfazer uma alteração incorreta?

As cinco prioridades recomendadas são:

1. **Seleção e edição em lote**, com prévia, validação, resultado por item e histórico.
2. **Visões operacionais salvas**, incluindo “estoque baixo”, “sem imagem”, “cadastro incompleto” e “erro de sincronização”.
3. **Status de publicação e sincronização por canal**, porque este sistema é a origem de dados do e-commerce e de outros front-ends.
4. **Paginação escalável e estados de erro explícitos**, substituindo a heurística atual de “carregar mais” e evitando que falhas pareçam listas vazias.
5. **Saúde do catálogo e inteligência de estoque/preço**, para orientar o trabalho por prioridade e impacto comercial.

A recomendação é implantar primeiro os fundamentos operacionais e de confiabilidade. Recursos de IA podem diferenciar o produto, mas devem entrar depois, como assistência revisável, e não como substitutos de filtros, validações, auditoria e operações em lote.

## 2. Escopo e método

A análise foi baseada em:

- revisão estática de `src/app/dashboard/page.tsx`;
- revisão dos componentes em `src/app/dashboard/_components/catalog/`;
- revisão dos DTOs e do serviço de produtos PDV;
- verificação das rotas adjacentes de criação, importação e detalhes do produto;
- comparação documental com padrões atuais de Shopify, Adobe Commerce e Odoo;
- critérios de acessibilidade do WCAG 2.2 e padrões de interação do WAI-ARIA.

### Limitações

Este não é um teste de usabilidade com operadores reais e não inclui dados de analytics, gravações de sessão, tempos de tarefa ou entrevistas. O servidor local não estava ativo durante a análise; portanto, a avaliação visual e interativa foi inferida da implementação atual. As prioridades devem ser validadas com usuários dos perfis de estoque, preço e cadastro antes da definição final do roadmap.

## 3. Experiência existente

### 3.1 Recursos já disponíveis

| Área | Implementação observada |
|---|---|
| Busca | Pesquisa comunicada como “nome ou SKU”, acionada por Enter ou botão, com limpeza rápida. |
| Filtros | Categoria hierárquica, marca, tipo, apenas produtos em estoque e ordenação. |
| Ordenação | Nome crescente/decrescente, mais recentes e preço crescente/decrescente. |
| Persistência | Busca e filtros ficam na URL; o modo grade/lista fica no `localStorage`. |
| Filtros ativos | Painel resume pesquisa e filtros aplicados e informa produtos carregados em relação ao total. |
| Visualizações | Grade; cards compactos no modo lista em telas menores; tabela em telas desktop. |
| Dados visíveis | Imagem, nome, SKU, marca, tipo, garantia, estoque, preços de atacado/varejo, categorias e indicadores de promoção, lançamento, importado e esgotado, dependendo da visualização. |
| Edição rápida | Nome, três preços, estoque e relacionamentos de categoria podem ser alterados sem abrir a página completa. |
| Imagens | Produto sem imagem oferece upload direto por clique ou arrastar e soltar. |
| Navegação | Abertura de detalhes preserva os filtros na URL de retorno. |
| Feedback | Skeleton inicial, indicador de transição, mensagens de sucesso/erro e confirmações em ações destrutivas. |
| Responsividade | Layouts específicos para grade, lista móvel e tabela desktop. |

### 3.2 Pontos fortes

- **Boa redução de navegação:** as edições inline atendem tarefas frequentes sem exigir abrir o cadastro completo.
- **Estado de consulta recuperável:** filtros na URL permitem recarregar, favoritar ou compartilhar a consulta.
- **Alternância de visualização instantânea:** grade/lista é uma preferência local e não provoca nova busca.
- **Hierarquia de categorias compreensível:** o menu oferece drill-down, breadcrumb, contagem e retorno de nível.
- **Feedback adequado nas edições individuais:** há validação, estado de salvamento, mensagens e suporte a Enter/Escape.
- **Adaptação por dispositivo:** a tabela é reservada para desktop, enquanto telas menores recebem cards.
- **Base técnica preparada para evolução:** a tela já recebe o total real da API e mantém responsabilidades de busca, apresentação e edição relativamente separadas.

## 4. Diagnóstico de experiência

### 4.1 A tela é eficiente para um produto, mas não para muitos

Não há seleção de linhas/cards nem uma barra de ações coletivas. Atualizar preços, estoque, categoria ou status de dezenas de itens exige repetir a mesma interação produto a produto. Esse é o recurso essencial mais evidente em uma ferramenta de manutenção de catálogo.

O benchmark confirma que seleção, ações em lote e editor tabular são recursos centrais em plataformas maduras. A Shopify permite selecionar produtos de uma visão filtrada e abrir um editor em lote; o editor de estoque trabalha com linhas, colunas configuráveis, atalhos e detecção de conflito. O Adobe Commerce também combina seleção, ações, colunas, ordenação, paginação e visões da grade.

### 4.2 O operador precisa procurar trabalho em vez de receber uma fila de prioridades

Os filtros atuais descrevem atributos básicos, mas não identificam problemas operacionais. Faltam consultas como:

- estoque baixo, crítico ou negativo;
- sem imagem ou imagem com erro;
- sem categoria, marca ou tipo;
- preço ausente, zerado ou incoerente;
- cadastro incompleto para publicação;
- produto desatualizado há muito tempo;
- falha de sincronização com e-commerce, PDV ou outro canal;
- produto alterado recentemente;
- produto ativo, inativo, rascunho, bloqueado ou arquivado.

Além disso, não há visões salvas por usuário ou equipe. O operador refaz filtros recorrentes em vez de abrir uma fila como “Revisar toda manhã”.

### 4.3 Aplicar vários filtros exige interações repetidas

O painel lateral é fechado após a alteração de categoria, marca, tipo, estoque ou ordenação. Isso é simples para um filtro, mas obriga o usuário a reabrir o painel várias vezes para montar uma consulta combinada. Em telas móveis, o custo é ainda maior.

Há duas soluções coerentes:

- manter o painel aberto e atualizar os resultados em segundo plano; ou
- tratar as escolhas como rascunho, mostrar uma estimativa de resultados e aplicar tudo uma única vez.

A segunda opção reduz chamadas e oferece maior previsibilidade. A primeira preserva a atualização instantânea já comunicada pela interface. A escolha deve ser validada com os operadores.

### 4.4 A ordenação pode ficar invisível

A ordenação diferente do padrão não participa do contador nem do resumo de filtros ativos. Assim, um resultado pode parecer inesperado sem que a causa esteja visível fora do painel. A ordenação deve ficar exposta na toolbar ou em um chip separado, mesmo que não seja contabilizada como filtro.

### 4.5 O carregamento incremental não usa todo o conhecimento disponível

A página recebe `total`, mas o botão “Carregar mais” decide que existem novos itens apenas verificando se a quantidade carregada é maior ou igual ao limite. Quando o total é exatamente igual ao limite, o botão ainda pode aparecer. Cada clique aumenta o limite em 50 e solicita novamente todo o conjunto acumulado, o que amplia payload, renderização e tempo de resposta à medida que o catálogo cresce.

Uma solução escalável deve usar `total` e paginação real por página ou cursor, com:

- tamanho de página configurável no desktop;
- próxima página sem baixar novamente os itens anteriores;
- restauração de posição ao voltar dos detalhes;
- total sempre visível;
- seleção que possa abranger a página atual ou todos os resultados filtrados.

Rolagem infinita pode ser oferecida na grade, mas não deve eliminar paginação, localização ou recuperação de contexto para tarefas administrativas.

### 4.6 Falhas podem parecer “nenhum produto encontrado”

Quando a busca principal falha, a página converte o erro em lista vazia e total zero. A interface exibe o mesmo estado usado para uma pesquisa legítima sem resultados. Falhas em marcas, categorias e tipos também viram coleções vazias, reduzindo silenciosamente as opções de filtro.

São necessários estados distintos para:

1. catálogo realmente vazio;
2. consulta sem correspondências;
3. falha ao carregar produtos;
4. falha parcial ao carregar opções de filtro;
5. conexão lenta ou atualização em andamento.

O estado de falha deve explicar a consequência, preservar a consulta e oferecer “Tentar novamente”. Nunca deve sugerir que os dados foram apagados ou que não existem produtos.

### 4.7 Os modos de visualização não apresentam a mesma informação

Indicadores de promoção, lançamento e importado aparecem sobre a imagem na grade, mas a imagem compacta do modo lista evidencia apenas esgotado. O preço corporativo pode ser editado junto com os demais, porém permanece oculto na exibição normal. No desktop, clicar no atacado ou no varejo abre o mesmo formulário com os três preços.

Isso cria dois problemas:

- o operador muda de visualização e perde sinais importantes;
- a edição oferece um escopo maior do que o campo que iniciou a ação.

A lista deve ter uma semântica consistente. Preferências de coluna podem controlar densidade, mas não devem alterar silenciosamente o significado do status ou da edição.

### 4.8 Faltam ações de entrada e saída no contexto da lista

A criação de produto existe em `/dashboard/product/new-product`, mas não há um CTA evidente dentro da experiência do catálogo. A rota de importação existe, porém está marcada como “em desenvolvimento”. Também não há exportação contextual dos itens filtrados ou selecionados.

Uma central moderna deve oferecer no cabeçalho:

- **Novo produto** como ação primária;
- **Importar** e **Exportar** como ações secundárias;
- modelo de arquivo, validação prévia e relatório de erros para importação;
- exportação da página, da seleção ou de todos os resultados filtrados.

O botão de importação só deve ser exposto quando o fluxo estiver funcional e seguro.

### 4.9 Edições críticas precisam de mais contexto e proteção

Preço e estoque são alterados diretamente, mas a lista não mostra:

- última alteração e responsável;
- motivo do ajuste de estoque;
- histórico de preço/estoque;
- alerta de concorrência quando outro usuário altera o mesmo produto;
- opção de desfazer;
- custo, margem ou limites comerciais;
- status de propagação da alteração para os canais consumidores.

Para um ERP, “salvou com sucesso” não basta. O operador precisa saber se a alteração é válida, auditável e efetivamente distribuída.

### 4.10 Busca e filtros ainda podem crescer para o contexto operacional

O campo comunica busca por nome ou SKU. Para equipes de estoque e cadastro, também são valiosos:

- leitura de EAN/GTIN por scanner ou câmera;
- referência e modelo;
- marca e categoria;
- correspondência tolerante a acentos e pequenos erros;
- sugestões recentes e resultados instantâneos;
- pesquisa avançada por tokens, por exemplo `sem:imagem`, `estoque:<5` ou `marca:"Acme"`;
- filtro por intervalos de preço, estoque e data de atualização;
- seleção múltipla de marcas, tipos e categorias.

As listas de marcas e tipos carregam no máximo 100 opções na página atual. Para bases maiores, os seletores precisam de busca remota e paginação. O menu de categorias limita a navegação a três níveis; taxonomias mais profundas devem continuar acessíveis.

### 4.11 Pontos de acessibilidade e ergonomia a revisar

A implementação já usa tabelas semânticas, textos alternativos, regiões de status e vários rótulos acessíveis. Ainda assim, merecem revisão:

- o botão “X” de limpeza da busca não apresenta rótulo acessível explícito;
- os botões “X” nos badges de filtros dependem do contexto visual;
- alguns acionadores compactos de edição e categoria podem ter área de toque inferior ao confortável;
- ações reveladas principalmente por hover são menos descobertas no desktop e não ajudam usuários que ampliam a interface;
- a tabela não oferece ordenação pelos cabeçalhos nem navegação avançada por teclado;
- foco, anúncio de quantidade de resultados e retorno de foco após sheets/dialogs devem ser testados com leitor de tela;
- textos muito compactos nos cards móveis devem ser validados com zoom de 200%.

O WCAG 2.2 estabelece alvo mínimo de 24 × 24 CSS pixels, salvo exceções de espaçamento, e exige que mensagens de progresso, sucesso e erro possam ser determinadas por tecnologia assistiva.

## 5. Experiência-alvo recomendada

A tela deve evoluir de “lista pesquisável com edição inline” para uma **workspace operacional do catálogo** com quatro camadas:

1. **Orientação:** total, visões rápidas, alertas e prioridades do dia.
2. **Descoberta:** busca ampla, scanner, filtros combináveis e visões salvas.
3. **Execução:** edição individual, seleção em lote, editor tabular e importação/exportação.
4. **Confiança:** validação, auditoria, permissões, desfazer, conflitos e status de sincronização.

### Cabeçalho recomendado

- Título “Catálogo” e total de produtos.
- Indicadores acionáveis: “12 sem imagem”, “8 com estoque crítico”, “3 com erro de integração”.
- Ação primária “Novo produto”.
- Menu “Importar / Exportar / Histórico de operações”.

### Visões rápidas

- Todos
- Estoque baixo
- Esgotados
- Pendências de cadastro
- Erros de publicação
- Alterados recentemente
- Minhas visões

As visões devem armazenar filtros, ordenação, colunas e densidade, com escopo privado, compartilhado com a equipe ou padrão da organização.

### Área de resultados

- Tabela configurável como modo principal para manutenção intensiva no desktop.
- Grade para inspeção visual e tratamento de imagens.
- Colunas redimensionáveis, reordenáveis, ocultáveis e fixáveis.
- Cabeçalhos ordenáveis e filtros por coluna quando fizer sentido.
- Painel lateral de visualização rápida, mantendo consulta, seleção e posição.
- Barra de ação fixa ao selecionar produtos.

## 6. Backlog priorizado

Legenda de esforço: **P** = pequeno, **M** = médio, **G** = grande. As estimativas são relativas e dependem das APIs existentes.

| ID | Recurso | Prioridade | Impacto esperado | Esforço | Dependência principal |
|---|---|---:|---|---:|---|
| R01 | Seleção e edição em lote | P0 | Redução drástica de tarefas repetitivas | G | APIs bulk, permissões, auditoria |
| R02 | Visões salvas e filas operacionais | P0 | Acesso imediato ao trabalho prioritário | M/G | Novos filtros e persistência por usuário/organização |
| R03 | Status de publicação/sincronização por canal | P0 | Confiança de que a alteração chegou aos consumidores | G | Telemetria e estado das integrações |
| R04 | Paginação real e total sempre visível | P0 | Escala, previsibilidade e melhor desempenho | M | Contrato de paginação estável |
| R05 | Estados de erro, vazio e falha parcial distintos | P0 | Evita decisões com base em uma falsa lista vazia | P/M | Propagação de erros segura |
| R06 | Novo produto, importar e exportar no cabeçalho | P0 | Fluxo de trabalho completo no contexto da lista | M/G | Finalizar importação e criar jobs assíncronos |
| R07 | Painel de filtros que permita composição | P0 | Menos cliques e menos reaberturas, sobretudo no móvel | P/M | Decisão entre aplicar ou atualizar ao vivo |
| R08 | Busca expandida e leitura de código de barras | P1 | Localização mais rápida no balcão e no estoque | M/G | Busca indexada por EAN, referência e modelo |
| R09 | Colunas, densidade e layout por usuário | P1 | Workspace adaptada a cadastro, estoque ou preço | M | Persistência de preferências |
| R10 | Histórico, motivo, desfazer e detecção de conflito | P1 | Redução de erros e maior auditabilidade | G | Versionamento e trilha de alterações |
| R11 | Saúde/completude do catálogo | P1 | Qualidade maior no e-commerce e menos cadastros incompletos | G | Regras de qualidade por tipo/canal |
| R12 | Prévia rápida em drawer | P1 | Menos perda de contexto ao revisar vários itens | M | DTO resumido e carregamento sob demanda |
| R13 | Inteligência de estoque | P1 | Menos rupturas e reposição melhor priorizada | G | Mínimo, reservado, disponível, giro e lead time |
| R14 | Inteligência de preço e promoção | P1 | Proteção de margem e planejamento comercial | G | Custo, regras, vigência e histórico |
| R15 | Duplicar produto e modelos de cadastro | P1 | Cadastro repetitivo mais rápido e consistente | M | Regras de cópia e unicidade |
| R16 | Assistente de IA com revisão humana | P2 | Diferenciação e aceleração de tarefas de conteúdo/análise | G | Dados confiáveis, governança e avaliação |
| R17 | Tarefas, comentários e aprovações | P2 | Coordenação de equipes e redução de trabalho paralelo | G | Modelo de workflow e notificações |
| R18 | Automações por regra | P2 | Operação proativa em catálogos grandes | G | Motor de eventos, permissões e logs |

## 7. Detalhamento dos recursos essenciais

### R01 — Seleção e edição em lote

Fluxo recomendado:

1. Selecionar itens individualmente, a página atual ou todos os resultados filtrados.
2. Abrir uma barra fixa com contagem e ações compatíveis com a permissão do usuário.
3. Escolher a alteração: preços, estoque, marca, tipo, categorias, status, publicação, exportação ou enriquecimento.
4. Exibir uma prévia com quantidade afetada, campos alterados e alertas.
5. Confirmar a operação com uma chave de idempotência.
6. Processar em segundo plano quando o volume for grande.
7. Informar sucessos e falhas por item, permitindo baixar o relatório e repetir apenas os erros.
8. Registrar responsável, horário, valores anteriores e novos.

Para preço e estoque, o editor tabular deve permitir copiar/colar, preencher para baixo, navegar por teclado e revisar células modificadas. Conflitos precisam ser detectados antes de sobrescrever alterações recentes de outro usuário.

### R02 — Visões salvas e filtros operacionais

Uma visão salva deve incluir:

- consulta e filtros;
- ordenação;
- colunas e densidade;
- escopo privado/equipe/organização;
- nome e descrição;
- quantidade atual e variação desde a última abertura, quando útil.

Visões padrão recomendadas:

- “Prontos para publicar”;
- “Pendências de conteúdo”;
- “Sem imagem”;
- “Sem categoria”;
- “Estoque crítico”;
- “Preço a revisar”;
- “Falha de sincronização”;
- “Alterados por mim”.

### R03 — Publicação e sincronização

Como o Manager ERP alimenta e-commerce e outros sistemas, cada produto deveria expor um resumo como:

- status interno: rascunho, ativo, inativo ou arquivado;
- disponibilidade por canal;
- última sincronização;
- pendente, processando, sincronizado, aviso ou erro;
- mensagem segura e acionável no caso de erro;
- ação para tentar novamente, quando autorizada;
- link para o histórico da integração.

O operador deve conseguir filtrar e agir em lote sobre falhas. O status não pode depender somente de cor.

### R10 — Segurança operacional e auditoria

Recomendações mínimas:

- feedback otimista apenas quando for reversível;
- opção de desfazer mudanças simples por curto período;
- confirmação com resumo para mudanças coletivas;
- motivo obrigatório em ajustes sensíveis de estoque;
- alerta de preço abaixo do custo ou fora da política comercial;
- controle de concorrência por versão/data de atualização;
- permissões distintas para visualizar, editar, aprovar e publicar;
- trilha de auditoria exportável.

### R11 — Saúde do catálogo

Criar uma pontuação ou, preferencialmente, uma lista explícita de requisitos por canal e tipo de produto:

- identidade: nome, SKU, EAN e marca;
- classificação: tipo e categorias;
- mídia: imagem principal válida e qualidade mínima;
- conteúdo: descrição curta, descrição comercial e atributos obrigatórios;
- comercial: preços válidos e promoção coerente;
- fiscal/logístico: NCM, peso e dimensões quando obrigatórios;
- descoberta: slug e metadados;
- operação: estoque, status e sincronização.

A pontuação deve explicar cada pendência e abrir diretamente o campo a corrigir. Não deve esconder regras de negócio em um número genérico.

### R16 — IA como assistente, não como piloto automático

Casos de uso recomendados para uma fase posterior:

- busca em linguagem natural, convertida em filtros visíveis e editáveis;
- sugestão de categoria e atributos com nível de confiança;
- detecção de possíveis duplicidades por nome, EAN, referência e imagem;
- detecção de anomalias de preço e estoque;
- geração/revisão de descrição e metadados;
- remoção de fundo e padronização de imagens;
- resumo diário das pendências de maior impacto;
- sugestão de reposição baseada em giro, lead time e sazonalidade.

Toda sugestão deve mostrar fonte, confiança e campos afetados, exigir revisão humana antes da publicação e ser auditável. Conteúdo gerado não deve inventar características do produto.

## 8. Ganhos rápidos

Itens que podem gerar valor antes das grandes mudanças de backend:

1. Manter o painel de filtros aberto durante a composição ou adicionar “Aplicar filtros”.
2. Mostrar sempre o total de resultados e a ordenação atual.
3. Diferenciar catálogo vazio, nenhum resultado e erro de carregamento.
4. Usar `total` para decidir corretamente se há mais produtos.
5. Expor “Novo produto” no cabeçalho da lista.
6. Tornar promoção, lançamento, importado e esgotado consistentes entre grade e lista.
7. Tornar explícito que a edição de preço altera atacado, corporativo e varejo, ou editar somente o preço acionado.
8. Adicionar rótulos acessíveis aos botões de limpeza e remoção de filtros.
9. Revisar áreas de toque dos controles compactos e visibilidade das ações sem hover.
10. Restaurar posição de rolagem ao voltar dos detalhes.

Esses itens não substituem seleção em lote, status de sincronização nem auditoria; apenas removem fricções imediatas.

## 9. Roadmap recomendado

### Fase 0 — Validação com usuários e métricas

- entrevistar operadores de cadastro, estoque e preço;
- observar tarefas reais com 1, 10 e 100 produtos;
- registrar termos de busca, consultas sem resultado e filtros mais usados;
- estabelecer baseline de tempo, erros e volume de alterações;
- validar quais estados e canais são realmente necessários.

### Fase 1 — Confiabilidade e eficiência básica

- estados de erro/vazio;
- total e paginação real;
- composição de filtros;
- ordenação visível;
- CTA de novo produto;
- consistência entre visualizações;
- revisão de acessibilidade.

### Fase 2 — Operação em escala

- seleção persistente;
- edição e ações em lote;
- importação/exportação assíncrona;
- colunas e densidade personalizadas;
- visões salvas;
- histórico de operações.

### Fase 3 — Qualidade e integração

- saúde do catálogo;
- status por canal e fila de erros;
- auditoria, aprovação e conflitos;
- estoque baixo e regras comerciais de preço;
- drawer de prévia rápida.

### Fase 4 — Diferenciação

- automações configuráveis;
- IA para busca, classificação, conteúdo e anomalias;
- previsão de reposição;
- tarefas e colaboração.

Cada fase deve ser liberada de forma incremental para um grupo piloto, medindo resultado antes de ampliar o escopo.

## 10. Métricas de sucesso

| Objetivo | Métrica sugerida |
|---|---|
| Encontrar produtos mais rápido | Tempo mediano até abrir ou selecionar o produto correto |
| Melhorar busca | Taxa de pesquisas sem resultado e reformulações por sessão |
| Reduzir repetição | Tempo e número de interações para atualizar 10/100 produtos |
| Evitar erros | Taxa de falha, reversão e correção após alterações |
| Melhorar qualidade | Quantidade de produtos com pendências por tipo e tempo médio de resolução |
| Evitar ruptura | Produtos abaixo do mínimo, dias em ruptura e tempo até ação de reposição |
| Aumentar confiança | Percentual de alterações sincronizadas sem erro e tempo de recuperação |
| Medir adoção | Uso de visões salvas, operações em lote, scanner e prévia rápida |
| Garantir acessibilidade | Conclusão de tarefas apenas com teclado e auditoria WCAG 2.2 AA |

Também é recomendável medir satisfação por tarefa, e não apenas uma avaliação genérica da tela.

## 11. Requisitos de backend e governança

As maiores melhorias dependem de capacidades além da interface:

- paginação por cursor ou página com ordenação estável e total confiável;
- filtros por ausência de atributo, status, intervalo, data e múltiplos valores;
- endpoint de alteração em lote com pré-validação, idempotência e retorno por item;
- jobs assíncronos para importação, exportação e grandes operações;
- versionamento otimista para evitar sobrescrita concorrente;
- trilha de auditoria de produto, preço, estoque, publicação e integração;
- modelo de status por canal e telemetria de sincronização;
- regras de qualidade configuráveis por organização, canal e tipo de produto;
- persistência de visões e preferências por usuário/organização;
- autorização granular e possível fluxo de aprovação.

Sem essas bases, uma interface sofisticada pode apenas esconder operações frágeis.

## 12. Riscos e cuidados

- **Sobrecarga visual:** não colocar todos os novos indicadores em cada card; usar visões, colunas e drawers progressivos.
- **Operações em lote perigosas:** sempre oferecer prévia, escopo explícito e relatório por item.
- **Estoque sem rastreabilidade:** diferenciar definição absoluta de ajuste/movimento e exigir motivo quando necessário.
- **IA com dados incorretos:** nunca publicar automaticamente atributos ou descrições não confirmados.
- **Preferências fragmentadas:** definir claramente o que é por usuário, equipe e organização.
- **Filtros sem índice:** novos filtros e busca tolerante precisam ser planejados com o backend para não degradar desempenho.
- **Rolagem infinita em administração:** preservar localização, seleção, URL e retorno de contexto.
- **Métricas que incentivam comportamento errado:** uma pontuação de completude deve explicar regras e não estimular preenchimento artificial.

## 13. Conclusão

O catálogo atual tem uma base sólida e moderna para manutenção individual. Para superar soluções concorrentes, o próximo salto deve priorizar **operação em escala, trabalho orientado por exceção e confiança nas alterações**.

O diferencial sustentável não será apenas uma lista mais bonita. Será permitir que o operador identifique problemas antes que afetem os canais de venda, corrija muitos produtos com segurança, entenda o impacto de cada mudança e confirme que os dados chegaram ao destino correto.

Em ordem prática: corrigir as fricções do filtro e os estados de erro, implantar paginação real, levar ações de criação/importação/exportação para o contexto da lista, construir visões salvas e edição em lote, e então evoluir para saúde do catálogo, sincronização, inteligência e IA assistiva.

## 14. Evidências internas consultadas

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/loading.tsx`
- `src/app/dashboard/_components/catalog/catalog-shell.tsx`
- `src/app/dashboard/_components/catalog/catalog-toolbar/catalog-toolbar.tsx`
- `src/app/dashboard/_components/catalog/catalog-toolbar/catalog-search.tsx`
- `src/app/dashboard/_components/catalog/catalog-toolbar/catalog-active-filters-panel.tsx`
- `src/app/dashboard/_components/catalog/catalog-toolbar/filter-panel/filter-panel.tsx`
- `src/app/dashboard/_components/catalog/catalog-toolbar/filter-panel/category-menu.tsx`
- `src/app/dashboard/_components/catalog/product-grid/product-grid.tsx`
- `src/app/dashboard/_components/catalog/product-grid/load-more-button.tsx`
- `src/app/dashboard/_components/catalog/product-table.tsx`
- `src/app/dashboard/_components/catalog/product-card/`
- `src/services/api-main/product-pdv/`
- `src/app/dashboard/product/new-product/page.tsx`
- `src/app/dashboard/product/import-products/page.tsx`

## 15. Referências externas

- [Shopify — pesquisar, filtrar, ordenar, editar colunas e gerenciar visões de produtos](https://help.shopify.com/en/manual/products/searching-filtering)
- [Shopify — pesquisa, filtros e visões salvas em listas administrativas](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/searching-filtering-views)
- [Shopify — edição de estoque em lote, colunas e tratamento de conflitos](https://help.shopify.com/en/manual/products/inventory/adjusting-inventory/bulk-editing-inventory)
- [Shopify — exportação de produtos](https://help.shopify.com/en/manual/products/import-export/export-products)
- [Shopify — gerenciamento de estoque e histórico de ajustes](https://help.shopify.com/en/manual/products/inventory)
- [Adobe Commerce — controles de grids administrativos](https://experienceleague.adobe.com/en/docs/commerce-admin/start/admin/tools/admin-grid-controls)
- [Adobe Commerce — workspace de produto e opções de salvar/duplicar](https://experienceleague.adobe.com/en/docs/commerce-admin/catalog/products/product-workspace)
- [Odoo — uso de códigos de barras para produtos e localizações](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/barcode/setup/software.html)
- [W3C/WCAG 2.2 — tamanho mínimo de alvos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [W3C/WCAG 2.2 — mensagens de status](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [WAI-ARIA APG — padrão de grid interativo e navegação por teclado](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [Shopify — geração assistida de descrições e responsabilidades sobre conteúdo de IA](https://help.shopify.com/en/manual/products/details/product-descriptions/shopify-magic)
