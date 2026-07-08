import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-service-api";
import { getProductsPdv } from "@/services/api-main/product-pdv/product-pdv-service-api";
import { getPtypes } from "@/services/api-main/ptype/ptype-service-api";
import { getTaxonomyMenu } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import { ProductCatalogContent } from "./_components/catalog/ProductCatalogContent";
import type { CategoryOption } from "./_components/catalog/ProductFiltersImproved";

const logger = createLogger("DashboardPage");

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    type?: string;
    stock?: string;
    sort?: string;
    limit?: string;
    page?: string;
  }>;
}

function mapSortToApiParams(sortBy?: string): {
  columnId: number;
  orderId: number;
} {
  switch (sortBy) {
    case "name-asc":
      return { columnId: 1, orderId: 1 };
    case "name-desc":
      return { columnId: 1, orderId: 2 };
    case "newest":
      return { columnId: 2, orderId: 2 };
    case "price-asc":
      return { columnId: 3, orderId: 1 };
    case "price-desc":
      return { columnId: 3, orderId: 2 };
    default:
      return { columnId: 2, orderId: 2 };
  }
}

function flattenCategories(taxonomies: UITaxonomyMenuItem[]): CategoryOption[] {
  return taxonomies.map((taxonomy) => {
    let displayName = taxonomy.name;
    if (taxonomy.level === 2) displayName = `- ${taxonomy.name}`;
    else if (taxonomy.level >= 3) displayName = `-- ${taxonomy.name}`;

    return {
      id: taxonomy.id,
      name: taxonomy.name,
      level: taxonomy.level,
      displayName,
    };
  });
}

async function getCategories(): Promise<CategoryOption[]> {
  try {
    const { apiContext } = await getAuthContext();
    const menuItems = await getTaxonomyMenu(2, 0, apiContext);
    return flattenCategories(menuItems);
  } catch (error) {
    logger.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export default async function DashboardPage(props: DashboardPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const sort = mapSortToApiParams(searchParams.sort);
  const limit = Number(searchParams.limit) || 20;

  const [products, brands, categories, ptypes] = await Promise.all([
    getProductsPdv({
      search: searchParams.search,
      taxonomyId: searchParams.category
        ? Number(searchParams.category)
        : undefined,
      brandId: searchParams.brand ? Number(searchParams.brand) : undefined,
      typeId: searchParams.type ? Number(searchParams.type) : undefined,
      flagStock: searchParams.stock === "1" ? 1 : undefined,
      recordsQuantity: limit,
      pageId: Number(searchParams.page) || 0,
      columnId: sort.columnId,
      orderId: sort.orderId,
      ...apiContext,
    }).catch((error) => {
      logger.error("Erro ao buscar produtos PDV:", error);
      return [] as Awaited<ReturnType<typeof getProductsPdv>>;
    }),
    getBrands({ limit: 100, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar marcas:", error);
      return [] as Awaited<ReturnType<typeof getBrands>>;
    }),
    getCategories(),
    getPtypes({ limit: 100, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar tipos:", error);
      return [] as Awaited<ReturnType<typeof getPtypes>>;
    }),
  ]);

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
                  <p className="text-muted-foreground mt-2">
                    Gerencie e visualize todos os produtos do seu catálogo com
                    filtros avançados.
                  </p>
                </div>

                <ProductCatalogContent
                  products={products}
                  brands={brands}
                  categories={categories}
                  ptypes={ptypes}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
