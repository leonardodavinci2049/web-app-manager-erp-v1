import type { UIPtype } from "@/services/api-main/ptype";
import { PtypeCollection } from "./ptype-collection";
import { PtypeDetailSheet } from "./ptype-detail-sheet";
import { PtypeToolbar } from "./ptype-toolbar";
import type {
  PtypeDetailData,
  PtypeSearchParams,
} from "./types/ptype-dashboard-types";

interface PtypeDashboardProps {
  items: UIPtype[];
  total: number;
  searchState: PtypeSearchParams;
  detail: PtypeDetailData | undefined;
  hasLoadError: boolean;
}

export function PtypeDashboard({
  items,
  total,
  searchState,
  detail,
  hasLoadError,
}: PtypeDashboardProps) {
  const grid = (
    <PtypeCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="grid"
      hasLoadError={hasLoadError}
    />
  );
  const list = (
    <PtypeCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="list"
      hasLoadError={hasLoadError}
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tipos de produtos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organize os tipos usados para classificar os produtos do catálogo.
        </p>
      </div>

      <PtypeToolbar searchState={searchState} grid={grid} list={list} />

      <PtypeDetailSheet
        key={searchState.ptypeId ?? "closed"}
        detail={detail}
        searchState={searchState}
        currentPageItemCount={items.length}
      />
    </div>
  );
}
