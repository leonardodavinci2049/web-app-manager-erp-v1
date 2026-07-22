import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import {
  getTaxonomies,
  getTaxonomyById,
  getTaxonomyMenuManager,
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
  CategoryProductDto,
} from "./_components/category-types";

const logger = createLogger("CategoryDashboardPage");
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
  const [menuResult, activeListItems, inactiveListItems] = await Promise.all([
    getTaxonomyMenuManager({ limit: 1000, ...apiContext }).catch((error) => {
      logger.error("Failed to load category menu", error);
      dataError = "Não foi possível carregar a hierarquia completa.";
      return { items: [], totalTaxonomies: 0 };
    }),
    getTaxonomies({ inactive: 0, recordsQuantity: 1000, ...apiContext }).catch(
      (error) => {
        logger.error("Failed to load active category list", error);
        return [];
      },
    ),
    getTaxonomies({ inactive: 1, recordsQuantity: 1000, ...apiContext }).catch(
      (error) => {
        logger.error("Failed to load inactive category list", error);
        return [];
      },
    ),
  ]);

  const baseById = new Map<number, UITaxonomy>();
  for (const category of [...activeListItems, ...inactiveListItems]) {
    baseById.set(category.id, category);
  }
  for (const category of menuResult.items) {
    const current = baseById.get(category.id);
    baseById.set(category.id, {
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      imagePath: category.imagePath,
      imageId: current?.imageId,
      level: category.level,
      order: category.order,
      productCount: category.productCount,
      inactive: category.inactive,
      metaTitle: current?.metaTitle,
      metaDescription: current?.metaDescription,
      notes: current?.notes,
    });
  }

  const detailedCategories = await Promise.all(
    [...baseById.keys()].map(async (id) => {
      try {
        return await getTaxonomyById(id, apiContext);
      } catch (error) {
        logger.warn("Failed to load one category detail", { id, error });
        return undefined;
      }
    }),
  );
  for (const category of detailedCategories) {
    if (!category) continue;
    const menu = baseById.get(category.id);
    baseById.set(category.id, {
      ...category,
      productCount: menu?.productCount ?? category.productCount,
    });
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
      const result = await getProductsManager({
        taxonomyId: detail.id,
        search: productSearch,
        recordsQuantity: 30,
        pageId: productPage,
        ...apiContext,
      });
      productTotal = result.total;
      products = result.products.map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        ean: product.ean,
        brand: product.brand,
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
        initialSearch={search}
        initialLevel={level}
        initialStatus={status}
        initialWithoutProducts={withoutProducts}
        initialIssue={issue}
        initialTab={tab}
        productSearch={productSearch}
        dataError={dataError}
      />
    </>
  );
}
