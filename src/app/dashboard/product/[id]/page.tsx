import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";
import { getSafeProductReturnTo } from "@/app/dashboard/catalog/_components";
import {
  ProductDetailsLayout,
  ProductDetailsLayoutSkeleton,
} from "@/app/dashboard/product/[id]/components/ProductDetailsLayout";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/lib/logger";
import { getAuthContext } from "@/server/auth-context";
import { getProductManagerById } from "@/services/api-main/product-manager/product-manager-service-api";

const logger = createLogger("ProductDetailsPageV2");

// Schema for validating dynamic route parameters
const ProductPageParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID deve ser um número válido")
    .transform(Number),
});

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Server Component - Fetch data directly
async function ProductDetailsPageContent({
  productId,
  returnTo,
}: {
  productId: number;
  returnTo: string;
}) {
  const { apiContext } = await getAuthContext();

  const result = await getProductManagerById(productId, {
    ...apiContext,
    pe_type_business: 1,
  }).catch((error) => {
    logger.error(
      `Erro ao buscar produto do Manager por ID ${productId}:`,
      error,
    );
    return undefined;
  });

  if (!result) {
    logger.warn(`Product not found or error occurred for ID: ${productId}`);
    notFound();
  }

  const { product, relatedCategories } = result;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            {/* New Modern Product Details Layout */}
            <ProductDetailsLayout
              product={product}
              productId={productId}
              relatedCategories={relatedCategories}
              returnTo={returnTo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailsPage({
  params,
  searchParams,
}: ProductDetailsPageProps) {
  await connection();
  const [routeParams, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  // Validate and extract product ID from route params
  let productId: number;

  try {
    const validatedParams = ProductPageParamsSchema.parse({
      id: routeParams.id,
    });
    productId = validatedParams.id;
  } catch (error) {
    logger.error("Invalid product ID parameter:", error);
    notFound();
  }

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeProductReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  // O breadcrumb reflete a hierarquia canonica do produto; preserva filtros
  // quando a origem e o catalogo e mantem o path canonico nos demais casos.
  const catalogHref = returnTo.startsWith("/dashboard/catalog")
    ? returnTo
    : "/dashboard/catalog";

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Produtos", href: "#" },
    { label: "Catálogo", href: catalogHref },
    { label: "Detalhes", isActive: true },
  ];

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do Produto"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-6 py-6">
                  <div className="px-4 lg:px-6">
                    <ProductDetailsLayoutSkeleton />
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <ProductDetailsPageContent
            productId={productId}
            returnTo={returnTo}
          />
        </Suspense>
      </div>
    </>
  );
}
