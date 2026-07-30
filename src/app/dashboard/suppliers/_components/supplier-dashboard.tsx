import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierCollection } from "./supplier-collection";
import { SupplierToolbar } from "./supplier-toolbar";
import type { SupplierSearchParams } from "./types/supplier-dashboard-types";

interface SupplierDashboardProps {
  items: UISupplier[];
  total: number;
  searchState: SupplierSearchParams;
  hasLoadError: boolean;
}

export function SupplierDashboard({
  items,
  total,
  searchState,
  hasLoadError,
}: SupplierDashboardProps) {
  const grid = (
    <SupplierCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="grid"
      hasLoadError={hasLoadError}
    />
  );
  const list = (
    <SupplierCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="list"
      hasLoadError={hasLoadError}
    />
  );

  return <SupplierToolbar searchState={searchState} grid={grid} list={list} />;
}
