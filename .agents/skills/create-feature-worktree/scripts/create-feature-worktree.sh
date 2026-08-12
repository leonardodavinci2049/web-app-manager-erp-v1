#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Uso: $0 <slug-da-feature> [referencia-base]" >&2
  echo "Exemplo: $0 catalog-image-gallery develop" >&2
}

if (( $# < 1 || $# > 2 )); then
  usage
  exit 1
fi

feature_slug="$1"
base_ref="${2:-develop}"

if [[ ! "${feature_slug}" =~ ^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$ ]]; then
  echo "Erro: use apenas letras minúsculas, números e hífens no slug da feature." >&2
  exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
git_common_dir="$(git -C "${script_dir}" rev-parse --path-format=absolute --git-common-dir)"
project_root="$(cd -- "${git_common_dir}/.." && pwd)"
project_name="$(basename -- "${project_root}")"
projects_root="$(cd -- "${project_root}/../.." && pwd)"
worktrees_root="${MERCURY_WORKTREES_ROOT:-${projects_root}/mercury-worktrees}"
project_worktrees_root="${worktrees_root}/${project_name}"
worktree_path="${project_worktrees_root}/${feature_slug}"
branch_name="feature/${feature_slug}"

if ! git -C "${project_root}" rev-parse --verify --quiet "${base_ref}^{commit}" >/dev/null; then
  echo "Erro: a referência-base não existe: ${base_ref}" >&2
  exit 1
fi

if git -C "${project_root}" show-ref --verify --quiet "refs/heads/${branch_name}"; then
  echo "Erro: a branch local já existe: ${branch_name}" >&2
  exit 1
fi

if [[ -e "${worktree_path}" || -L "${worktree_path}" ]]; then
  echo "Erro: o destino já existe: ${worktree_path}" >&2
  exit 1
fi

mkdir -p -- "${project_worktrees_root}"

git -C "${project_root}" worktree add \
  -b "${branch_name}" \
  "${worktree_path}" \
  "${base_ref}"

for local_directory in .agents .codex .claude; do
  source_path="${project_root}/${local_directory}"

  if [[ -d "${source_path}" ]]; then
    cp -a -- "${source_path}" "${worktree_path}/"
  fi
done

for env_file in .env .env.local; do
  source_path="${project_root}/${env_file}"

  if [[ -f "${source_path}" ]]; then
    install -m 600 -- "${source_path}" "${worktree_path}/${env_file}"
  fi
done

images_source_path="${project_root}/public/images"

if [[ -d "${images_source_path}" ]]; then
  mkdir -p -- "${worktree_path}/public"
  cp -a -- "${images_source_path}" "${worktree_path}/public/"
fi

for documentation_link in API-documentation API-assets-documentation; do
  source_path="${project_root}/${documentation_link}"

  if [[ -L "${source_path}" ]]; then
    ln -s -- "$(readlink -- "${source_path}")" "${worktree_path}/${documentation_link}"
  fi
done

echo
echo "Worktree criada com sucesso."
echo "Branch: ${branch_name}"
echo "Caminho: ${worktree_path}"
echo
echo "Próximos comandos:"
echo "  cd ${worktree_path}"
echo "  pnpm install --frozen-lockfile"
echo "  git status"
