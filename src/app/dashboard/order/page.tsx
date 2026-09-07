import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import {
  RegistryLoading,
  RegistryPageShell,
} from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getCustomersPage } from "@/services/api-main/customer-general";
import { getOrdersManagerOrders } from "@/services/api-main/order_manager";
import { getSellersPage } from "@/services/api-main/seller";
import {
  buildOrderUrl,
  getDefaultOrderPeriod,
  mapOrderSort,
  OrderDashboard,
  parseOrderSearchParams,
} from "./_components";

const logger = createLogger("OrderPage");

interface OrderPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function OrderPageContent({ searchParams }: OrderPageProps) {
  await connection();
  const rawSearchParams = await searchParams;
  const { apiContext } = await getAuthContext();
  const referenceDate = new Date();
  const defaultPeriod = getDefaultOrderPeriod(referenceDate);
  const searchState = parseOrderSearchParams(rawSearchParams, referenceDate);
  const sort = mapOrderSort(searchState.sort);
  const returnTo = buildOrderUrl(searchState);
  const hasActiveQuery = Boolean(
    searchState.search ||
      searchState.startDate !== defaultPeriod.startDate ||
      searchState.endDate !== defaultPeriod.endDate ||
      searchState.customerId ||
      searchState.sellerId ||
      searchState.orderStatusId ||
      searchState.financialStatusId ||
      searchState.deliveryStatusId ||
      searchState.locationId ||
      searchState.sort !== "default" ||
      searchState.limit !== 50,
  );

  const ordersResultPromise = fetchAccumulatedPages(
    (page) =>
      getOrdersManagerOrders({
        startDate: searchState.startDate,
        endDate: searchState.endDate,
        search: searchState.search,
        customerId: searchState.customerId,
        sellerId: searchState.sellerId,
        orderStatusId: searchState.orderStatusId,
        financialStatusId: searchState.financialStatusId,
        deliveryStatusId: searchState.deliveryStatusId,
        locationId: searchState.locationId,
        recordsPerPage: searchState.limit,
        pageId: page,
        sortColumnId: sort.columnId,
        sortOrderId: sort.orderId,
        ...apiContext,
      }),
    searchState.page,
    searchState.accum,
    (result) => ({ items: result.orders, total: result.total }),
    (order) => order.id,
    (page, error) =>
      logger.error(`Erro ao buscar pedidos de venda (pagina ${page}):`, error),
  );

  const [ordersResult, customersResult, sellersResult] = await Promise.all([
    ordersResultPromise,
    getCustomersPage({ page: 0, pageSize: 100, ...apiContext }).catch(
      (error) => {
        logger.error(
          "Erro ao buscar clientes para os filtros de pedidos:",
          error,
        );
        return { items: [], total: 0 };
      },
    ),
    getSellersPage({ page: 0, pageSize: 100, ...apiContext }).catch((error) => {
      logger.error(
        "Erro ao buscar vendedores para os filtros de pedidos:",
        error,
      );
      return { items: [], total: 0 };
    }),
  ]);

  const customerOptions = customersResult.items.map((customer) => ({
    id: customer.customerId,
    label: customer.name,
  }));
  const sellerOptions = sellersResult.items.map((seller) => ({
    id: seller.id,
    label: seller.name,
  }));

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Pedidos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pedidos", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Pedidos de venda"
        description="Consulte os pedidos feitos por vendedores para clientes, seus valores e o andamento de cada etapa."
      >
        <OrderDashboard
          orders={ordersResult.items}
          total={ordersResult.total}
          searchState={searchState}
          defaultPeriod={defaultPeriod}
          returnTo={returnTo}
          hasLoadError={ordersResult.hasBaseFailure}
          hasActiveQuery={hasActiveQuery}
          customerOptions={customerOptions}
          sellerOptions={sellerOptions}
        />
      </RegistryPageShell>
    </>
  );
}

export default function OrderPage(props: OrderPageProps) {
  return (
    <Suspense fallback={<RegistryLoading title="Pedidos de venda" />}>
      <OrderPageContent {...props} />
    </Suspense>
  );
}
