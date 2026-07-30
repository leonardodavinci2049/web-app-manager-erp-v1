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
