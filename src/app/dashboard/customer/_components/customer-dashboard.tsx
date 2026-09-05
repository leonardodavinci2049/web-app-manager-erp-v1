import type { UICustomerListItem } from "@/services/api-main/customer-general";
import { CustomerCollection } from "./customer-list/customer-collection";
import { CustomerToolbar } from "./customer-toolbar/customer-toolbar";
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

  return <CustomerToolbar searchState={searchState} grid={grid} list={list} />;
}
