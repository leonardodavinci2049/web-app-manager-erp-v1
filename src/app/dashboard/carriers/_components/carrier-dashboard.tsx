import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierCollection } from "./carrier-collection";
import { CarrierToolbar } from "./carrier-toolbar";
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Transportadoras</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie transportadoras, contatos e dados fiscais usados nas
          entregas.
        </p>
      </div>
      <CarrierToolbar searchState={searchState} grid={grid} list={list} />
    </div>
  );
}
