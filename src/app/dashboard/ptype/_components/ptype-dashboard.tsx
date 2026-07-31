import type { UIPtype } from "@/services/api-main/ptype";
import { PtypeCollection } from "./ptype-collection";
import { PtypeToolbar } from "./ptype-toolbar";
import type { PtypeSearchParams } from "./types/ptype-dashboard-types";

interface PtypeDashboardProps {
  items: UIPtype[];
  total: number;
  searchState: PtypeSearchParams;
  hasLoadError: boolean;
}

export function PtypeDashboard({
  items,
  total,
  searchState,
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
    </div>
  );
}
