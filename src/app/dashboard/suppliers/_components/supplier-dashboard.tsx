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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Consulte e mantenha os fornecedores utilizados nas operações de
          compra.
        </p>
      </div>
      <SupplierToolbar searchState={searchState} grid={grid} list={list} />
    </div>
  );
}
