"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import {
  REGISTRY_DEFAULT_PAGE_LIMIT,
  RegistryActiveFilters,
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import { Button } from "@/components/ui/button";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import {
  buildPurchasingUrl,
  PURCHASING_CRITICALITY_OPTIONS,
  PURCHASING_DEFAULT_SORT,
  PURCHASING_SORT_OPTIONS,
  parsePurchasingFilters,
} from "./lib/search-params";
import { PurchasingExcelIcon } from "./purchasing-excel-icon";
import { PurchasingFilterPanel } from "./purchasing-filter-panel";
import type {
  PurchasingCategoryOption,
  PurchasingFilters,
  PurchasingPanelFilter,
  PurchasingSupplierOption,
} from "./types/purchasing-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "purchasing:product-view-mode";
const EXPORT_ROUTE_PATH = "/dashboard/purchasing/export";
const EXPORT_FALLBACK_FILENAME = "necessidade-de-compra.xlsx";

const PANEL_DEFAULTS: Pick<PurchasingFilters, PurchasingPanelFilter> = {
  categoryId: undefined,
  brandId: undefined,
  typeId: undefined,
  supplierId: undefined,
  salesList: 0,
  stockList: 0,
  advancedFilter: 0,
  origin: 0,
  premium: false,
  criticality: 0,
  sort: PURCHASING_DEFAULT_SORT,
  pageLimit: REGISTRY_DEFAULT_PAGE_LIMIT,
};

const DEFAULT_FILTERS: PurchasingFilters = {
  searchTerm: "",
  ...PANEL_DEFAULTS,
};

interface PurchasingToolbarProps {
  brands: UIBrand[];
  categories: PurchasingCategoryOption[];
  ptypes: UIPtype[];
  supplierOptions: PurchasingSupplierOption[];
  grid: ReactNode;
  list: ReactNode;
}

const ORIGIN_LABELS = ["", "Importados", "Nacionais"];

export function PurchasingToolbar({
  brands,
  categories,
  ptypes,
  supplierOptions,
  grid,
  list,
}: PurchasingToolbarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportInFlightRef = useRef(false);
  const filters = useMemo(
    () => parsePurchasingFilters(searchParams),
    [searchParams],
  );
  const latestFilters = useRef(filters);
  latestFilters.current = filters;

  const updateFilters = useCallback(
    (next: PurchasingFilters) => {
      latestFilters.current = next;
      startTransition(() => router.replace(buildPurchasingUrl(next)));
    },
    [router],
  );

  const updateSearch = useCallback(
    (searchTerm: string) =>
      updateFilters({ ...latestFilters.current, searchTerm }),
    [updateFilters],
  );

  const handleExport = useCallback(async () => {
    if (exportInFlightRef.current) return;
    exportInFlightRef.current = true;
    setIsExporting(true);
    try {
      const exportParams = new URLSearchParams(searchParams.toString());
      exportParams.delete("page");
      exportParams.delete("accum");
      const query = exportParams.toString();
      const response = await fetch(
        `${EXPORT_ROUTE_PATH}${query ? `?${query}` : ""}`,
      );
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("spreadsheetml")) {
        let message =
          "Não foi possível gerar o arquivo. Tente novamente em instantes.";
        try {
          const data: unknown = await response.json();
          if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
          ) {
            message = data.error;
          }
        } catch {
          // Mantém a mensagem padrão quando a resposta não é JSON válido.
        }
        toast.error(message);
        return;
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename =
        /filename="([^"]+)"/.exec(disposition)?.[1] ?? EXPORT_FALLBACK_FILENAME;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("Download do arquivo Excel iniciado.");
    } catch {
      toast.error(
        "Falha ao baixar a exportação. Verifique sua conexão e tente novamente.",
      );
    } finally {
      exportInFlightRef.current = false;
      setIsExporting(false);
    }
  }, [searchParams]);

  const activeFilters = useMemo(() => {
    const result: Array<{ key: string; label: string; value: string }> = [];
    const add = (
      condition: boolean,
      key: string,
      label: string,
      value: string,
    ) => {
      if (condition) result.push({ key, label, value });
    };
    add(
      Boolean(filters.searchTerm),
      "searchTerm",
      "Pesquisa",
      filters.searchTerm,
    );
    add(
      Boolean(filters.categoryId),
      "categoryId",
      "Categoria",
      categories.find((item) => item.id === filters.categoryId)?.name ??
        String(filters.categoryId ?? ""),
    );
    add(
      Boolean(filters.brandId),
      "brandId",
      "Marca",
      brands.find((item) => item.id === filters.brandId)?.name ??
        String(filters.brandId ?? ""),
    );
    add(
      Boolean(filters.typeId),
      "typeId",
      "Tipo",
      ptypes.find((item) => item.id === filters.typeId)?.name ??
        String(filters.typeId ?? ""),
    );
    add(
      Boolean(filters.supplierId),
      "supplierId",
      "Fornecedor",
      supplierOptions.find((option) => option.id === filters.supplierId)
        ?.label ?? `ID ${filters.supplierId}`,
    );
    add(
      filters.origin !== 0,
      "origin",
      "Origem",
      ORIGIN_LABELS[filters.origin],
    );
    add(filters.premium, "premium", "Premium", "Somente premium");
    add(
      filters.criticality !== 0,
      "criticality",
      "Criticidade",
      PURCHASING_CRITICALITY_OPTIONS.find(
        (option) => option.value === filters.criticality,
      )?.label ?? String(filters.criticality),
    );
    add(
      filters.sort !== PURCHASING_DEFAULT_SORT,
      "sort",
      "Ordenação",
      PURCHASING_SORT_OPTIONS.find((item) => item.value === filters.sort)
        ?.label ?? filters.sort,
    );
    add(
      filters.pageLimit !== REGISTRY_DEFAULT_PAGE_LIMIT,
      "pageLimit",
      "Por página",
      String(filters.pageLimit),
    );
    return result;
  }, [brands, categories, filters, ptypes, supplierOptions]);

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "searchTerm") {
        updateFilters({ ...latestFilters.current, searchTerm: "" });
        return;
      }
      const panelKey = key as PurchasingPanelFilter;
      updateFilters({
        ...latestFilters.current,
        [panelKey]: PANEL_DEFAULTS[panelKey],
      });
    },
    [updateFilters],
  );

  const panelActiveCount = activeFilters.filter(
    ({ key }) => key !== "searchTerm",
  ).length;
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={filters.searchTerm}
            placeholder="Buscar por ID, nome, referência ou modelo..."
            accessibleLabel="Pesquisar produtos com necessidade de compra"
            pending={pending}
            onSearch={updateSearch}
          />
          <PurchasingFilterPanel
            filters={filters}
            brands={brands}
            categories={categories}
            ptypes={ptypes}
            supplierOptions={supplierOptions}
            open={filterOpen}
            pending={pending}
            activeCount={panelActiveCount}
            onOpenChange={setFilterOpen}
            onApply={updateFilters}
            onClear={() =>
              updateFilters({
                ...latestFilters.current,
                ...PANEL_DEFAULTS,
              })
            }
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden shrink-0 md:inline-flex"
            onClick={handleExport}
            disabled={isExporting}
            aria-label="Exportar necessidade de compra para Excel"
            title="Exportar para Excel"
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <PurchasingExcelIcon className="size-4" />
            )}
            Exportar
          </Button>
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
        </div>
      </div>

      <RegistryActiveFilters
        filters={activeFilters}
        pending={pending}
        onRemove={removeFilter}
        onClear={() => updateFilters(DEFAULT_FILTERS)}
      />

      <p className="sr-only" aria-live="polite">
        {pending ? "Atualizando consulta" : "Consulta atualizada"}
      </p>
      {isExporting && (
        <p className="sr-only" aria-live="polite">
          Gerando o arquivo Excel da necessidade de compra.
        </p>
      )}
      <RegistryResults pending={pending}>
        {viewMode === "grid" ? grid : list}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="necessidade de compra"
        filterCount={panelActiveCount}
        filterOpen={filterOpen}
        onOpenFilters={() => setFilterOpen(true)}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        extraAction={{
          label: isExporting ? "Exportando" : "Excel",
          icon: PurchasingExcelIcon,
          onClick: handleExport,
          disabled: isExporting,
        }}
      />
    </div>
  );
}
