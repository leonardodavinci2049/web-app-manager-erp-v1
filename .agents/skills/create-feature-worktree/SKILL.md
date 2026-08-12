---
name: create-feature-worktree
description: Cria uma Git worktree isolada para uma nova feature do web-app-manager-erp-v1 usando o fluxo local padronizado, com branch de feature baseada em slug, configurações locais de agentes, arquivos de ambiente protegidos, imagens públicas e links de documentação. Use quando o usuário pedir para criar, iniciar ou preparar uma feature worktree neste projeto. Não use para integrar, remover, podar ou encerrar worktrees existentes.
---

# Criar feature worktree

Criar a worktree por meio de `scripts/create-feature-worktree.sh`. Não reproduzir manualmente a sequência encapsulada pelo script.

## Preparar a execução

1. Confirmar que o repositório em escopo é `web-app-manager-erp-v1`.
2. Inspecionar `git status --short --branch` e `git worktree list` sem modificar o estado atual.
3. Obter o slug da feature. Aceitar somente letras minúsculas, números e hífens, sem o prefixo `feature/`.
4. Usar a referência-base informada pelo usuário. Quando ela não for informada, usar `develop`.
5. Informar antes da execução que serão criados uma branch local e um diretório de worktree.

Não exigir que o checkout principal esteja limpo: a criação parte do commit da referência-base e não transporta alterações rastreadas não commitadas. Preservar todas as alterações existentes.

## Executar

A partir da raiz do repositório, executar:

```bash
./.agents/skills/create-feature-worktree/scripts/create-feature-worktree.sh <slug> [referencia-base]
```

O script deve:

- criar `feature/<slug>` a partir da referência-base;
- criar a worktree em `${MERCURY_WORKTREES_ROOT:-<diretorio-projects>/mercury-worktrees}/web-app-manager-erp-v1/<slug>`;
- copiar `.agents`, `.codex` e `.claude`, quando existirem;
- copiar `.env` e `.env.local`, quando existirem, com permissão `0600`;
- copiar `public/images`, quando existir;
- recriar os links simbólicos `API-documentation` e `API-assets-documentation`, quando existirem;
- não copiar `docs`, `node_modules` nem alterações rastreadas não commitadas.

Não contornar uma validação recusada pelo script. Se a branch, o destino ou a referência-base já existir em estado incompatível, interromper e relatar o conflito sem remover ou sobrescrever nada.

## Verificar e entregar

1. Confirmar a nova entrada com `git worktree list`.
2. Executar `git status --short --branch` dentro da nova worktree.
3. Executar `pnpm install --frozen-lockfile` dentro da worktree somente quando o usuário tiver pedido um ambiente pronto para desenvolvimento ou autorizar a instalação necessária.
4. Informar objetivamente a branch, o caminho, a referência-base e se as dependências foram instaladas.

Não integrar, remover, podar ou excluir a worktree ou a branch como parte desta skill.
