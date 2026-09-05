"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  type RegistryActiveFilter,
  RegistryActiveFilters,
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import { Button } from "@/components/ui/button";
import { CustomerCreateSheet } from "./customer-create-sheet";
import { CustomerFilterPanel } from "./customer-filter-panel";
import {
  buildCustomerDetailHref,
  buildCustomerUrl,
  countCustomerFilters,
} from "./lib/search-params";
import {
  type CustomerSearchParams,
  DEFAULT_CUSTOMER_LIMIT,
} from "./types/customer-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:customer-view-mode";

interface CustomerToolbarProps {
  searchState: CustomerSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

function getDefaultFilters(search: string): CustomerSearchParams {
  return {
    search,
    categoryId: 0,
    clientType: 0,
    personType: 0,
    noImage: false,
    approved: 0,
    gender: 0,
    restricted: 0,
    enabled: 0,
    statusId: 0,
    operation: 0,
    startDate: "",
    endDate: "",
    sort: "id",
    order: "desc",
    page: 0,
    limit: DEFAULT_CUSTOMER_LIMIT,
    accum: 0,
  };
}

export function CustomerToolbar({
  searchState,
  grid,
  list,
}: CustomerToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  const navigate = useCallback(
    (nextState: CustomerSearchParams) => {
      startTransition(() =>
        router.replace(buildCustomerUrl(nextState, pathname)),
      );
    },
    [pathname, router],
  );

  const activeFilters = useMemo<RegistryActiveFilter[]>(() => {
    const filters: RegistryActiveFilter[] = [];
    const add = (
      condition: boolean,
      key: string,
      label: string,
      value: string,
    ) => condition && filters.push({ key, label, value });

    add(
      searchState.categoryId !== 0,
      "categoryId",
      "Categoria",
      String(searchState.categoryId),
    );
    add(
      searchState.clientType !== 0,
      "clientType",
      "Tipo de cliente",
      ["", "Atacado", "Varejo", "Não informado"][searchState.clientType] ??
        String(searchState.clientType),
    );
    add(
      searchState.personType !== 0,
      "personType",
      "Pessoa",
      searchState.personType === 1 ? "Física" : "Jurídica",
    );
    add(searchState.noImage, "noImage", "Imagem", "Sem imagem");
    add(
      searchState.approved !== 0,
      "approved",
      "Aprovação",
      searchState.approved === 1 ? "Não aprovados" : "Aprovados",
    );
    add(
      searchState.gender !== 0,
      "gender",
      "Gênero",
      searchState.gender === 1 ? "Masculino" : "Feminino",
    );
    add(
      searchState.restricted !== 0,
      "restricted",
      "Restrição",
      searchState.restricted === 1 ? "Sem restrição" : "Com restrição",
    );
    add(
      searchState.enabled !== 0,
      "enabled",
      "Habilitação",
      searchState.enabled === 1 ? "Inativos" : "Ativos",
    );
    add(
      searchState.statusId !== 0,
      "statusId",
      "Status",
      String(searchState.statusId),
    );
    const operationLabels: Record<number, string> = {
      1: "Sem compra",
      2: "Compras nos últimos 3 meses",
      3: "Compras nos últimos 6 meses",
      6: "Compras no último ano",
      7: `${searchState.startDate} a ${searchState.endDate}`,
    };
    add(
      searchState.operation !== 0,
      "operation",
      "Operação",
      operationLabels[searchState.operation] ?? String(searchState.operation),
    );
    add(
      searchState.sort !== "id",
      "sort",
      "Ordenação",
      searchState.sort === "name" ? "Nome" : "Última compra",
    );
    add(searchState.order !== "desc", "order", "Direção", "Crescente");
    add(
      searchState.limit !== DEFAULT_CUSTOMER_LIMIT,
      "limit",
      "Por página",
      String(searchState.limit),
    );
    return filters;
  }, [searchState]);

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState.search));
    setFilterOpen(false);
  };

  const removeFilter = (key: string) => {
    const defaults = getDefaultFilters(searchState.search);
    const nextState = { ...searchState, page: 0, accum: 0 };
    switch (key) {
      case "categoryId":
        nextState.categoryId = defaults.categoryId;
        break;
      case "clientType":
        nextState.clientType = defaults.clientType;
        break;
      case "personType":
        nextState.personType = defaults.personType;
        break;
      case "noImage":
        nextState.noImage = defaults.noImage;
        break;
      case "approved":
        nextState.approved = defaults.approved;
        break;
      case "gender":
        nextState.gender = defaults.gender;
        break;
      case "restricted":
        nextState.restricted = defaults.restricted;
        break;
      case "enabled":
        nextState.enabled = defaults.enabled;
        break;
      case "statusId":
        nextState.statusId = defaults.statusId;
        break;
      case "operation":
        nextState.operation = defaults.operation;
        nextState.startDate = "";
        nextState.endDate = "";
        break;
      case "sort":
        nextState.sort = defaults.sort;
        break;
      case "order":
        nextState.order = defaults.order;
        break;
      case "limit":
        nextState.limit = defaults.limit;
        break;
    }
    navigate(nextState);
  };

  const handleCreated = (customerId: number) => {
    startTransition(() => {
      router.push(buildCustomerDetailHref(customerId, getDefaultFilters("")));
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={searchState.search}
            placeholder="Buscar cliente..."
            accessibleLabel="Pesquisar clientes"
            pending={isPending}
            onSearch={(search) =>
              navigate({ ...searchState, search, page: 0, accum: 0 })
            }
          />
          <CustomerFilterPanel
            filters={searchState}
            open={filterOpen}
            pending={isPending}
            onOpenChange={setFilterOpen}
            onApply={navigate}
            onClear={clearFilters}
          />
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
          <Button
            type="button"
            className="hidden h-11 shrink-0 md:ml-auto md:inline-flex"
            onClick={() => setCreateOpen(true)}
            aria-label="+ Novo cadastro de cliente"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">+ Novo Cadastro</span>
            <span className="sr-only lg:hidden">
              + Novo cadastro de cliente
            </span>
          </Button>
        </div>
      </div>

      <RegistryActiveFilters
        filters={activeFilters}
        pending={isPending}
        onRemove={removeFilter}
        onClear={clearFilters}
      />

      <RegistryResults pending={isPending}>
        {viewMode === "grid" ? grid : list}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="clientes"
        filterCount={countCustomerFilters(searchState)}
        filterOpen={filterOpen}
        onOpenFilters={() => setFilterOpen(true)}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        addLabel="Adicionar cliente"
        addOpen={createOpen}
        onAdd={() => setCreateOpen(true)}
      />

      <CustomerCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
