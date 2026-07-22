import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getTaxonomyById,
  getTaxonomyMenuManager,
  getTaxonomyProducts,
} from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import type { UITaxonomy } from "@/services/api-main/taxonomy-base/transformers/transformers";
import { CategoryDashboard } from "./_components/category-dashboard";
import {
  buildCategoryDetail,
  buildCategoryTree,
} from "./_components/category-hierarchy";
import type {
  CategoryFilterLevel,
  CategoryFilterStatus,
  CategoryFiltersState,
  CategoryProductDto,
} from "./_components/category-types";

const logger = createLogger("CategoryDashboardPage");
const CATEGORY_MENU_LIMIT = 10_000;
const PRODUCTS_PER_PAGE = 50;
interface CategoryDashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function positiveInteger(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function CategoryDashboardPage({
  searchParams,
}: CategoryDashboardPageProps) {
  await connection();
  const rawParams = await searchParams;
  const categoryId = positiveInteger(firstParam(rawParams.categoryId));
  const search = firstParam(rawParams.search).trim().slice(0, 100);
  const productSearch = firstParam(rawParams.productSearch)
    .trim()
    .slice(0, 100);
  const rawLevel = firstParam(rawParams.level);
  const level: CategoryFilterLevel = ["1", "2", "3"].includes(rawLevel)
    ? (rawLevel as CategoryFilterLevel)
    : "all";
  const rawStatus = firstParam(rawParams.status);
  const status: CategoryFilterStatus = ["active", "inactive"].includes(
    rawStatus,
  )
    ? (rawStatus as CategoryFilterStatus)
    : "all";
  const withoutProducts = firstParam(rawParams.withoutProducts) === "1";
  const rawIssue = firstParam(rawParams.issue);
  const issue = ["family-empty", "group-empty", "inconsistent"].includes(
    rawIssue,
  )
    ? rawIssue
    : "";
  const tab = firstParam(rawParams.tab) === "products" ? "products" : "details";
  const productPage = Math.max(
    0,
    positiveInteger(firstParam(rawParams.productPage)) ?? 0,
  );
  const { apiContext } = await getAuthContext();

  let dataError: string | undefined;
  const [menuResult, selectedCategoryDetail] = await Promise.all([
    getTaxonomyMenuManager({
      limit: CATEGORY_MENU_LIMIT,
      ...apiContext,
    }).catch((error) => {
      logger.error("Failed to load category menu", error);
      dataError = "Não foi possível carregar a hierarquia completa.";
      return { items: [], totalTaxonomies: 0 };
    }),
    categoryId
      ? getTaxonomyById(categoryId, apiContext).catch((error) => {
          logger.warn("Failed to load selected category detail", {
            categoryId,
            error,
          });
          return undefined;
        })
      : Promise.resolve(undefined),
  ]);

  const baseById = new Map<number, UITaxonomy>();
  for (const category of menuResult.items) {
    baseById.set(category.id, {
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      imagePath: category.imagePath,
      level: category.level,
      order: category.order,
      productCount: category.productCount,
      inactive: category.inactive,
    });
  }

  if (selectedCategoryDetail) {
    const menuCategory = baseById.get(selectedCategoryDetail.id);
    if (menuCategory) {
      baseById.set(selectedCategoryDetail.id, {
        ...menuCategory,
        imageId: selectedCategoryDetail.imageId,
        metaTitle: selectedCategoryDetail.metaTitle,
        metaDescription: selectedCategoryDetail.metaDescription,
        notes: selectedCategoryDetail.notes,
        createdAt: selectedCategoryDetail.createdAt,
        updatedAt: selectedCategoryDetail.updatedAt,
      });
    }
  }

  const categories = [...baseById.values()];
  const { tree, flat, stats } = buildCategoryTree(categories);
  const selectedCategory = categoryId ? baseById.get(categoryId) : undefined;
  const detail = selectedCategory
    ? buildCategoryDetail(selectedCategory, flat)
    : undefined;

  let products: CategoryProductDto[] = [];
  let productTotal = detail?.directProductCount ?? 0;
  if (detail && tab === "products") {
    try {
      const result = await getTaxonomyProducts({
        taxonomyId: detail.id,
        search: productSearch,
        flagNoFamily: 0,
        flagNoGroup: 0,
        flagNoSubgroup: 0,
        recordsQuantity: PRODUCTS_PER_PAGE,
        pageId: productPage,
        ...apiContext,
      });
      productTotal = result.total;
      products = result.items.map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        ref: product.ref,
        model: product.model,
        inactive: false,
      }));
    } catch (error) {
      logger.error("Failed to load products linked to category", {
        categoryId: detail.id,
        error,
      });
      dataError = "Não foi possível carregar os produtos desta categoria.";
    }
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Categorias"
        breadcrumbItems={[
          { label: "Início", href: "/dashboard" },
          { label: "Categorias", isActive: true },
        ]}
      />
      <CategoryDashboard
        tree={tree}
        flatCategories={flat}
        stats={stats}
        detail={detail}
        products={products}
        productTotal={productTotal}
        filters={
          {
            search,
            level,
            status,
            withoutProducts,
            issue,
          } satisfies CategoryFiltersState
        }
        tab={tab}
        productSearch={productSearch}
        productPage={productPage}
        productsPerPage={PRODUCTS_PER_PAGE}
        dataError={dataError}
      />
    </>
  );
}
