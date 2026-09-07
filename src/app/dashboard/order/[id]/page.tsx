import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { getSafeOrderReturnTo } from "@/app/dashboard/order/_components";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getOrdersManagerOrderById,
  OrderManagerNotFoundError,
} from "@/services/api-main/order_manager";
import { OrderDetailLayout } from "./_components/order-detail-layout";
import { OrderDetailSkeleton } from "./_components/order-detail-skeleton";

const logger = createLogger("OrderDetailsPage");
const OrderPageParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive()),
});

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function OrderDetailsContent({
  params,
  searchParams,
}: OrderDetailsPageProps) {
  await connection();
  const [routeParams, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const parsedParams = OrderPageParamsSchema.safeParse(routeParams);

  if (!parsedParams.success) {
    logger.warn("Invalid sales order ID", { id: routeParams.id });
    notFound();
  }

  const orderId = parsedParams.data.id;
  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeOrderReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();
  let result: Awaited<ReturnType<typeof getOrdersManagerOrderById>>;

  try {
    result = await getOrdersManagerOrderById(orderId, apiContext);
  } catch (error) {
    if (error instanceof OrderManagerNotFoundError) {
      logger.warn("Sales order was not found", { orderId });
      notFound();
    }

    logger.error("Failed to load sales order detail", { orderId, error });
    throw error;
  }

  if (!result) {
    logger.warn("Sales order is unavailable", { orderId });
    notFound();
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do pedido"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pedidos", href: returnTo },
          { label: `Pedido #${orderId}`, isActive: true },
        ]}
      />
      <main className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <OrderDetailLayout
                order={result.data}
                items={result.items}
                statusHistory={result.statusHistory}
                customer={result.customer}
                seller={result.seller}
                returnTo={returnTo}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function OrderDetailsPage(props: OrderDetailsPageProps) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailsContent {...props} />
    </Suspense>
  );
}
