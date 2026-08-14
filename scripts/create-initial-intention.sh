#!/usr/bin/env bash

set -euo pipefail

if (( $# < 1 )); then
  echo "Uso: $0 \"<nome do prompt>\"" >&2
  echo "Exemplo: $0 \"implementar cadastro de fornecedores\"" >&2
  exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd -- "${script_dir}/.." && pwd)"
prompt_name="$*"

if command -v iconv >/dev/null 2>&1; then
  prompt_name="$(printf '%s' "${prompt_name}" | iconv -f UTF-8 -t ASCII//TRANSLIT)"
fi

slug="$(
  printf '%s' "${prompt_name}" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
)"

if [[ -z "${slug}" ]]; then
  echo "Erro: o nome informado não contém caracteres válidos para o arquivo." >&2
  exit 1
fi

year="$(date '+%Y')"
month="$(date '+%m')"
timestamp="$(date '+%Y-%m-%d-%H%M')"
destination_dir="${project_root}/docs/initial-intention/${year}/${month}"
destination_file="${destination_dir}/${timestamp}-${slug}.md"

mkdir -p -- "${destination_dir}"

if [[ -e "${destination_file}" ]]; then
  echo "Erro: o arquivo já existe: ${destination_file}" >&2
  exit 1
fi

cat > "${destination_file}" <<'MARKDOWN'
# Task: [Nome claro da tarefa]

## Contexto

Descreva brevemente:

* O projeto ou módulo envolvido.
* O comportamento atual.
* O problema ou necessidade que motivou a tarefa.
* Informações técnicas importantes para entender o cenário.

## Objetivo

Descreva de forma direta o resultado esperado ao concluir a tarefa.

## Requisitos

* [Requisito funcional 1]
* [Requisito funcional 2]
* [Requisito funcional 3]

## Regras e restrições

* Preserve a arquitetura e os padrões existentes no projeto.
* Utilize TypeScript e mantenha todos os objetos devidamente tipados.
* Não altere funcionalidades que não estejam relacionadas com esta tarefa.
* Não instale novas dependências sem que sejam realmente necessárias.
* Priorize segurança, legibilidade, reutilização e desempenho.
* Não utilize dados simulados na implementação final, salvo quando solicitado.

## Arquivos ou áreas envolvidas

Se forem conhecidos, informe os principais arquivos, diretórios, componentes ou endpoints:

* `[caminho/do/arquivo]`
* `[caminho/do/diretório]`
* `[endpoint ou módulo]`

Caso não sejam conhecidos, examine a estrutura do projeto antes de implementar.

## Critérios de aceitação

A tarefa será considerada concluída quando:

* [Critério verificável 1]
* [Critério verificável 2]
* [Critério verificável 3]
* Não existirem erros de TypeScript, lint ou build relacionados à implementação.
* O comportamento existente que não faz parte da tarefa continuar funcionando.

## Validação

Após a implementação:

1. Execute as verificações disponíveis no projeto, como `typecheck`, `lint` e build.
2. Corrija os erros relacionados às alterações realizadas.
3. Verifique os principais fluxos afetados pela implementação.

## Entrega esperada

Ao finalizar, apresente:

* Um resumo objetivo das alterações realizadas.
* A lista dos principais arquivos criados ou modificados.
* Os comandos de validação executados e seus resultados.
* Possíveis limitações, decisões técnicas ou pendências encontradas.
MARKDOWN

relative_path="${destination_file#"${project_root}/"}"
echo "Arquivo criado: ${relative_path}"
