import type { UISellerListItem } from "@/services/api-main/seller";
import { SellerCollection } from "./seller-list/seller-collection";
import { SellerToolbar } from "./seller-toolbar/seller-toolbar";
import type { SellerSearchParams } from "./types/seller-dashboard-types";

interface SellerDashboardProps {
  items: UISellerListItem[];
  total: number;
  searchState: SellerSearchParams;
  hasLoadError: boolean;
}

export function SellerDashboard({
  items,
  total,
  searchState,
  hasLoadError,
}: SellerDashboardProps) {
  const grid = (
    <SellerCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="grid"
      hasLoadError={hasLoadError}
    />
  );
  const list = (
    <SellerCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="list"
      hasLoadError={hasLoadError}
    />
  );

  return <SellerToolbar searchState={searchState} grid={grid} list={list} />;
}
