import { PackageSearch, SearchX, TriangleAlert } from "lucide-react";
import { RegistryLoadMore } from "@/app/dashboard/_components/registry";
import type { UIEntryListItem } from "@/services/api-main/entry/transformers/transformers";
import { buildEntryDetailHref } from "../lib/search-params";
import type {
  EntrySearchParams,
  EntryViewMode,
} from "../types/entry-dashboard-types";
import { EntryCard } from "./entry-card";
import { EntryPagination } from "./entry-pagination";
import { EntryTable } from "./entry-table";

interface EntryCollectionProps {
  entries: UIEntryListItem[];
  total: number;
  pageSize: number;
  searchState: EntrySearchParams;
  pathname: string;
  viewMode: EntryViewMode;
  hasLoadError: boolean;
}

const GRID_CLASS =
  "grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4";
const LIST_CLASS = "space-y-2 sm:space-y-3";
const EAGER_IMAGE_COUNT = 6;

/**
 * Colecao de entradas (Server Component). Renderiza a variante do modo de
 * visualizacao ativo: grade de cards (desktop + mobile), tabela (somente
 * desktop, com fallback de cards no mobile) ou lista de cards (somente mobile,
 * com fallback de grade no desktop), alem dos estados vazio/erro, do resumo de
 * intervalo/total e da paginacao.
 */
export function EntryCollection({
  entries,
  total,
  pageSize,
  searchState,
  pathname,
  viewMode,
  hasLoadError,
}: EntryCollectionProps) {
  const buildDetailHref = (entryId: number) =>
    buildEntryDetailHref(entryId, searchState, pathname);

  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar as entradas
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Atualize a página para tentar novamente. A pesquisa foi preservada.
        </p>
      </div>
    );
  }

  if (total === 0) {
    const hasSearch = searchState.search.trim() !== "";
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {hasSearch ? (
          <SearchX className="text-muted-foreground mb-4 h-16 w-16" />
        ) : (
          <PackageSearch className="text-muted-foreground mb-4 h-16 w-16" />
        )}
        <h3 className="mb-2 text-lg font-semibold">
          {hasSearch
            ? "Nenhuma entrada encontrada"
            : "Nenhuma entrada cadastrada"}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {hasSearch
            ? "Não encontramos entradas que correspondam à pesquisa. Tente outro termo."
            : "Comece registrando a primeira entrada de mercadoria."}
        </p>
      </div>
    );
  }

  const pageStart = total > 0 ? searchState.page * pageSize + 1 : 0;
  const pageEnd = Math.min(searchState.page * pageSize + entries.length, total);

  const cardsList = (
    <div className={LIST_CLASS}>
      {entries.map((entry, index) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          viewMode="list"
          detailHref={buildDetailHref(entry.id)}
          eager={index === 0}
        />
      ))}
    </div>
  );

  const cardsGrid = (
    <div className={GRID_CLASS}>
      {entries.map((entry, index) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          viewMode="grid"
          detailHref={buildDetailHref(entry.id)}
          eager={index < EAGER_IMAGE_COUNT}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        cardsGrid
      ) : viewMode === "table" ? (
        <>
          <div className="lg:hidden">{cardsList}</div>
          <div className="hidden lg:block">
            <EntryTable entries={entries} buildDetailHref={buildDetailHref} />
          </div>
        </>
      ) : (
        <>
          <div className="lg:hidden">{cardsList}</div>
          <div className="hidden lg:block">{cardsGrid}</div>
        </>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-muted-foreground text-xs tabular-nums">
          Exibindo {pageStart}–{pageEnd} de {total}{" "}
          {total === 1 ? "entrada" : "entradas"}
        </p>
        <EntryPagination
          currentPage={searchState.page}
          total={total}
          pageSize={pageSize}
        />
        <RegistryLoadMore
          displayed={entries.length}
          total={total}
          label="Carregar mais entradas"
        />
      </div>
    </div>
  );
}
