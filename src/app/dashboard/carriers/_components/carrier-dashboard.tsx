import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierCollection } from "./carrier-list/carrier-collection";
import { CarrierToolbar } from "./carrier-toolbar/carrier-toolbar";
import type { CarrierSearchParams } from "./types/carrier-dashboard-types";

interface CarrierDashboardProps {
  items: UICarrier[];
  total: number;
  searchState: CarrierSearchParams;
  hasLoadError: boolean;
}

export function CarrierDashboard({
  items,
  total,
  searchState,
  hasLoadError,
}: CarrierDashboardProps) {
  const grid = (
    <CarrierCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="grid"
      hasLoadError={hasLoadError}
    />
  );
  const list = (
    <CarrierCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="list"
      hasLoadError={hasLoadError}
    />
  );

  return <CarrierToolbar searchState={searchState} grid={grid} list={list} />;
}
