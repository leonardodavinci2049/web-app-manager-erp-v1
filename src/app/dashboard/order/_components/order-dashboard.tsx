import type { UIOrdersManagerOrder } from "@/services/api-main/order_manager";
import { OrderResults } from "./order-list/order-results";
import { OrderToolbar } from "./order-toolbar/order-toolbar";
import type {
  OrderFilterOption,
  OrderSearchParams,
} from "./types/order-dashboard-types";

interface OrderDashboardProps {
  orders: UIOrdersManagerOrder[];
  total: number;
  searchState: OrderSearchParams;
  defaultPeriod: Pick<OrderSearchParams, "startDate" | "endDate">;
  returnTo: string;
  hasLoadError: boolean;
  hasActiveQuery: boolean;
  customerOptions: OrderFilterOption[];
  sellerOptions: OrderFilterOption[];
}

export function OrderDashboard({
  orders,
  total,
  searchState,
  defaultPeriod,
  returnTo,
  hasLoadError,
  hasActiveQuery,
  customerOptions,
  sellerOptions,
}: OrderDashboardProps) {
  const commonProps = {
    orders,
    total,
    page: searchState.page,
    pageSize: searchState.limit,
    returnTo,
    hasLoadError,
    hasActiveQuery,
  };

  return (
    <OrderToolbar
      defaultPeriod={defaultPeriod}
      customerOptions={customerOptions}
      sellerOptions={sellerOptions}
      grid={<OrderResults {...commonProps} viewMode="grid" />}
      list={<OrderResults {...commonProps} viewMode="list" />}
    />
  );
}
