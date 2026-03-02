import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { TaxonomyServiceApi } from "@/services/api/taxonomy/taxonomy-service-api";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { getBrands } from "@/services/api-main/brand/brand-cached-service";
import { getProductsPdv } from "@/services/api-main/product-pdv/product-pdv-cached-service";
import { getPtypes } from "@/services/api-main/ptype/ptype-cached-service";
import { ProductCatalogContent } from "./components/ProductCatalogContent";
import type { CategoryOption } from "./components/ProductFiltersImproved";

const logger = createLogger("CatalogoPage");

interface CatalogoPageProps {
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

function flattenCategories(
  taxonomies: TaxonomyData[],
  level: number = 1,
): CategoryOption[] {
  const result: CategoryOption[] = [];
  for (const taxonomy of taxonomies) {
    let displayName = taxonomy.TAXONOMIA;
    if (level === 2) displayName = `- ${taxonomy.TAXONOMIA}`;
    else if (level === 3) displayName = `-- ${taxonomy.TAXONOMIA}`;

    result.push({
      id: taxonomy.ID_TAXONOMY,
      name: taxonomy.TAXONOMIA,
      level,
      displayName,
    });

    if (taxonomy.children && taxonomy.children.length > 0) {
      result.push(...flattenCategories(taxonomy.children, level + 1));
    }
  }
  return result;
}

async function getCategories(): Promise<CategoryOption[]> {
  try {
    const response = await TaxonomyServiceApi.findTaxonomyMenu({
      pe_id_tipo: 2,
    });
    if (TaxonomyServiceApi.isValidTaxonomyMenuResponse(response)) {
      const taxonomies = TaxonomyServiceApi.extractTaxonomyMenuList(response);
      return flattenCategories(taxonomies);
    }
    return [];
  } catch (error) {
    logger.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export default async function CatalogoPage(props: CatalogoPageProps) {
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
    }),
    getBrands({ limit: 100, ...apiContext }),
    getCategories(),
    getPtypes({ limit: 100, ...apiContext }),
  ]);

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produtos", href: "#" },
          { label: "Catálogo", isActive: true },
        ]}
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
