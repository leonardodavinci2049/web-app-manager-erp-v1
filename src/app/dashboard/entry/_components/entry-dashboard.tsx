import type { UIEntryListItem } from "@/services/api-main/entry/transformers/transformers";
import { EntryCollection } from "./entry-list/entry-collection";
import { EntryToolbar } from "./entry-toolbar/entry-toolbar";
import type {
  EntryCreateOptionDto,
  EntrySearchParams,
} from "./types/entry-dashboard-types";

const ENTRY_PATHNAME = "/dashboard/entry";

interface EntryDashboardProps {
  entries: UIEntryListItem[];
  total: number;
  pageSize: number;
  searchState: EntrySearchParams;
  hasLoadError: boolean;
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
}

/**
 * Casca da central de entradas (Server Component). Compoe a toolbar (Client) e
 * a colecao (Server) nas tres variantes (grade, tabela e lista de cards). A
 * toolbar decide qual variante exibir conforme o modo de visualizacao efemero
 * escolhido pelo usuario e o dispositivo. Cada item navega para sua rota
 * dedicada de detalhes.
 */
export function EntryDashboard({
  entries,
  total,
  pageSize,
  searchState,
  hasLoadError,
  supplierOptions,
  carrierOptions,
}: EntryDashboardProps) {
  const collectionProps = {
    entries,
    total,
    pageSize,
    searchState,
    pathname: ENTRY_PATHNAME,
    hasLoadError,
  };

  const grid = <EntryCollection {...collectionProps} viewMode="grid" />;
  const table = <EntryCollection {...collectionProps} viewMode="table" />;
  const cards = <EntryCollection {...collectionProps} viewMode="cards" />;

  return (
    <div className="space-y-4">
      <EntryToolbar
        searchState={searchState}
        grid={grid}
        table={table}
        cards={cards}
        supplierOptions={supplierOptions}
        carrierOptions={carrierOptions}
      />
    </div>
  );
}
