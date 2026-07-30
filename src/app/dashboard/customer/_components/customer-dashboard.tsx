import type { UICustomerListItem } from "@/services/api-main/customer-general";
import { CustomerCollection } from "./customer-collection";
import { CustomerToolbar } from "./customer-toolbar";
import type { CustomerSearchParams } from "./types/customer-dashboard-types";

interface CustomerDashboardProps {
  items: UICustomerListItem[];
  total: number;
  searchState: CustomerSearchParams;
  hasLoadError: boolean;
}

export function CustomerDashboard({
  items,
  total,
  searchState,
  hasLoadError,
}: CustomerDashboardProps) {
  const grid = (
    <CustomerCollection
      items={items}
      total={total}
      searchState={searchState}
      viewMode="grid"
      hasLoadError={hasLoadError}
    />
  );
  const list = (
    <CustomerCollection
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
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie cadastros, contatos, endereços e relacionamento comercial.
        </p>
      </div>
      <CustomerToolbar searchState={searchState} grid={grid} list={list} />
    </div>
  );
}
