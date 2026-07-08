"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { FilterOptions, ViewMode } from "@/types/types";
import type { CategoryOption } from "./ProductFiltersImproved";
import { ProductFiltersImproved } from "./ProductFiltersImproved";
import { ProductGrid } from "./ProductGrid";

interface ProductCatalogContentProps {
  products: UIProductPdv[];
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
}

export function ProductCatalogContent({
  products,
  brands,
  categories,
  ptypes,
}: ProductCatalogContentProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const currentLimit = Number(searchParams.get("limit")) || 20;
  const currentSearch = searchParams.toString();
  const catalogReturnTo = currentSearch
    ? `${pathname}?${currentSearch}`
    : pathname;

  const filters: FilterOptions = {
    searchTerm: searchParams.get("search") || "",
    selectedCategory: searchParams.get("category") || "all",
    selectedSubcategory: undefined,
    selectedSubgroup: undefined,
    selectedBrand: searchParams.get("brand") || undefined,
    selectedPtype: searchParams.get("type") || undefined,
    onlyInStock: searchParams.get("stock") === "1",
    sortBy: (searchParams.get("sort") as FilterOptions["sortBy"]) || "newest",
  };

  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router],
  );

  const updateFilters = useCallback(
    (newFilters: FilterOptions) => {
      const params = new URLSearchParams();

      if (newFilters.searchTerm) params.set("search", newFilters.searchTerm);
      if (newFilters.selectedCategory && newFilters.selectedCategory !== "all")
        params.set("category", newFilters.selectedCategory);
      if (newFilters.selectedBrand)
        params.set("brand", newFilters.selectedBrand);
      if (newFilters.selectedPtype)
        params.set("type", newFilters.selectedPtype);
      if (newFilters.onlyInStock) params.set("stock", "1");
      if (newFilters.sortBy && newFilters.sortBy !== "newest")
        params.set("sort", newFilters.sortBy);

      updateUrl(params);
    },
    [updateUrl],
  );

  const loadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(currentLimit + 20));
    updateUrl(params);
  }, [searchParams, currentLimit, updateUrl]);

  const getProductDetailsHref = useCallback(
    (productId: number) => {
      const detailsHref = `/dashboard/product/${productId}`;

      if (!currentSearch) {
        return detailsHref;
      }

      const params = new URLSearchParams({
        returnTo: catalogReturnTo,
      });

      return `${detailsHref}?${params.toString()}`;
    },
    [catalogReturnTo, currentSearch],
  );

  const productDetailsHrefs = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          getProductDetailsHref(product.id),
        ]),
      ),
    [products, getProductDetailsHref],
  );

  const handleViewDetails = (productId: number) => {
    router.push(getProductDetailsHref(productId));
  };

  const handleImageUploadSuccess = () => {
    router.refresh();
  };

  const hasMore = products.length >= currentLimit;
  const isLoading = isPending;

  return (
    <>
      <ProductFiltersImproved
        filters={filters}
        categories={categories}
        brands={brands}
        ptypes={ptypes}
        viewMode={viewMode}
        onFiltersChange={updateFilters}
        onViewModeChange={setViewMode}
        totalProducts={products.length}
        displayedProducts={products.length}
        isLoading={isPending}
      />

      {isPending && (
        <div className="relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-lg font-medium">
                  Pesquisando produtos...
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Aguarde enquanto carregamos os resultados
              </p>
            </div>
          </div>
          <div className="opacity-50">
            <ProductGrid
              products={products}
              viewMode={viewMode}
              isLoading={isLoading}
              isInitialLoading={false}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onViewDetails={handleViewDetails}
              productDetailsHrefs={productDetailsHrefs}
              onImageUploadSuccess={handleImageUploadSuccess}
            />
          </div>
        </div>
      )}

      {!isPending && (
        <ProductGrid
          products={products}
          viewMode={viewMode}
          isLoading={isLoading}
          isInitialLoading={false}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onViewDetails={handleViewDetails}
          productDetailsHrefs={productDetailsHrefs}
          onImageUploadSuccess={handleImageUploadSuccess}
        />
      )}
    </>
  );
}
