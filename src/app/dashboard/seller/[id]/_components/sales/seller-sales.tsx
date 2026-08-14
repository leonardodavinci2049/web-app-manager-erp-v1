"use client";

import { Search } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findSellerOrdersAction } from "../../_actions/seller-sales-actions";
import { SellerOrdersList } from "./seller-sales-lists";
import type {
  SellerOrderListItem,
  SellerSalesActionResult,
} from "./seller-sales-types";
import { SellerSoldProductsTab } from "./seller-sold-products-tab";

const INITIAL_LIMIT = 20;
const LIMIT_INCREMENT = 20;
const SEARCH_DEBOUNCE_MS = 500;

type SalesTab = "orders" | "products";

type OrderFetcher = (input: {
  sellerId: number;
  search: string;
  limit: number;
}) => Promise<SellerSalesActionResult<SellerOrderListItem>>;

interface LazyListState {
  items: SellerOrderListItem[];
  error: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  retry: () => void;
  loadMore: () => void;
}

function useDebouncedValue(value: string): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedValue(value),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [value]);

  return debouncedValue;
}

function useLazyOrderList({
  sellerId,
  enabled,
  fetcher,
  search,
}: {
  sellerId: number;
  enabled: boolean;
  fetcher: OrderFetcher;
  search: string;
}): LazyListState {
  const debouncedSearch = useDebouncedValue(search);
  const requestIdRef = useRef(0);
  const [items, setItems] = useState<SellerOrderListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [loadedSearch, setLoadedSearch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (targetLimit: number, query: string, loadingMore: boolean) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setError(null);
      if (loadingMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setItems([]);
      }

      let result: SellerSalesActionResult<SellerOrderListItem>;
      try {
        result = await fetcher({
          sellerId,
          search: query,
          limit: targetLimit,
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        setLoadedSearch(query);
        setIsLoading(false);
        setIsLoadingMore(false);
        setHasMore(false);
        setError("Não foi possível comunicar com o servidor.");
        return;
      }
      if (requestId !== requestIdRef.current) return;

      setLoadedSearch(query);
      setIsLoading(false);
      setIsLoadingMore(false);
      if (!result.success) {
        setError(result.message);
        setHasMore(false);
        return;
      }

      setItems(result.items);
      setLimit(targetLimit);
      setHasMore(result.hasMore);
    },
    [sellerId, fetcher],
  );

  useEffect(() => {
    if (!enabled || loadedSearch === debouncedSearch) return;
    setLimit(INITIAL_LIMIT);
    void load(INITIAL_LIMIT, debouncedSearch, false);
  }, [debouncedSearch, enabled, load, loadedSearch]);

  return {
    items,
    error,
    isLoading: isLoading || (enabled && loadedSearch !== debouncedSearch),
    isLoadingMore,
    hasMore,
    retry: () => {
      void load(limit, debouncedSearch, false);
    },
    loadMore: () => {
      void load(limit + LIMIT_INCREMENT, debouncedSearch, true);
    },
  };
}

function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value.replace(/\D/g, ""));
  };

  return (
    <search>
      <form
        className="space-y-1.5"
        onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
      >
        <Label htmlFor={id}>{label}</Label>
        <div className="relative max-w-xl">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id={id}
            value={value}
            inputMode="numeric"
            maxLength={30}
            placeholder={placeholder}
            className="pl-9"
            autoComplete="off"
            onChange={handleChange}
          />
        </div>
        <p className="text-muted-foreground text-xs">
          A busca é atualizada automaticamente após 500 ms.
        </p>
      </form>
    </search>
  );
}

export function SellerSales({ sellerId }: { sellerId: number }) {
  const [activeTab, setActiveTab] = useState<SalesTab>("orders");
  const [orderSearch, setOrderSearch] = useState("");

  const orders = useLazyOrderList({
    sellerId,
    enabled: activeTab === "orders",
    fetcher: findSellerOrdersAction,
    search: orderSearch,
  });

  const handleTabChange = (value: string) => {
    if (value === "orders" || value === "products") setActiveTab(value);
  };

  return (
    <div className="rounded-lg border p-3 sm:p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-4">
        <TabsList
          className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit"
          aria-label="Vendas do vendedor"
        >
          <TabsTrigger value="orders" className="min-w-max flex-none">
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="products" className="min-w-max flex-none">
            Produtos vendidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <SearchField
            id="seller-orders-search"
            label="Buscar pedido pelo ID"
            placeholder="Digite o ID do pedido"
            value={orderSearch}
            onChange={setOrderSearch}
          />
          <SellerOrdersList {...orders} />
        </TabsContent>

        <TabsContent value="products">
          <SellerSoldProductsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
