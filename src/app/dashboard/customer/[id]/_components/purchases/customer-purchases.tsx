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
import {
  findCustomerOrdersAction,
  findCustomerPurchasedProductsAction,
  findCustomerWarrantiesAction,
} from "../../_actions/customer-purchases-actions";
import {
  CustomerOrdersList,
  CustomerPurchasedProductsList,
  CustomerWarrantiesList,
} from "./customer-purchases-lists";
import type {
  CustomerOrderListItem,
  CustomerPurchasedProductListItem,
  CustomerPurchasesActionResult,
  CustomerWarrantyListItem,
} from "./customer-purchases-types";

const INITIAL_LIMIT = 20;
const LIMIT_INCREMENT = 20;
const SEARCH_DEBOUNCE_MS = 500;

type PurchasesTab = "orders" | "products" | "warranties";

type ListFetcher<T> = (input: {
  customerId: number;
  search: string;
  limit: number;
}) => Promise<CustomerPurchasesActionResult<T>>;

interface LazyListState<T> {
  items: T[];
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

function useLazyList<T>({
  customerId,
  enabled,
  fetcher,
  search,
}: {
  customerId: number;
  enabled: boolean;
  fetcher: ListFetcher<T>;
  search: string;
}): LazyListState<T> {
  const debouncedSearch = useDebouncedValue(search);
  const requestIdRef = useRef(0);
  const [items, setItems] = useState<T[]>([]);
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

      let result: CustomerPurchasesActionResult<T>;
      try {
        result = await fetcher({
          customerId,
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
    [customerId, fetcher],
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
  numeric = false,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  numeric?: boolean;
  onChange: (value: string) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(numeric ? nextValue.replace(/\D/g, "") : nextValue);
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
            inputMode={numeric ? "numeric" : "search"}
            maxLength={numeric ? 30 : 300}
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

export function CustomerPurchases({ customerId }: { customerId: number }) {
  const [activeTab, setActiveTab] = useState<PurchasesTab>("orders");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [warrantySearch, setWarrantySearch] = useState("");

  const orders = useLazyList<CustomerOrderListItem>({
    customerId,
    enabled: activeTab === "orders",
    fetcher: findCustomerOrdersAction,
    search: orderSearch,
  });
  const products = useLazyList<CustomerPurchasedProductListItem>({
    customerId,
    enabled: activeTab === "products",
    fetcher: findCustomerPurchasedProductsAction,
    search: productSearch,
  });
  const warranties = useLazyList<CustomerWarrantyListItem>({
    customerId,
    enabled: activeTab === "warranties",
    fetcher: findCustomerWarrantiesAction,
    search: warrantySearch,
  });

  const handleTabChange = (value: string) => {
    if (value === "orders" || value === "products" || value === "warranties")
      setActiveTab(value);
  };

  return (
    <div className="rounded-lg border p-3 sm:p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-4">
        <TabsList
          className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit"
          aria-label="Compras do cliente"
        >
          <TabsTrigger value="orders" className="min-w-max flex-none">
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="products" className="min-w-max flex-none">
            Produtos
          </TabsTrigger>
          <TabsTrigger value="warranties" className="min-w-max flex-none">
            Garantias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <SearchField
            id="customer-orders-search"
            label="Buscar pedido pelo ID"
            placeholder="Digite o ID do pedido"
            value={orderSearch}
            numeric
            onChange={setOrderSearch}
          />
          <CustomerOrdersList {...orders} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <SearchField
            id="customer-products-search"
            label="Buscar nos produtos comprados"
            placeholder="Digite um produto"
            value={productSearch}
            onChange={setProductSearch}
          />
          <CustomerPurchasedProductsList {...products} />
        </TabsContent>

        <TabsContent value="warranties" className="space-y-4">
          <SearchField
            id="customer-warranties-search"
            label="Buscar garantia"
            placeholder="Digite o ID do produto"
            value={warrantySearch}
            onChange={setWarrantySearch}
          />
          <CustomerWarrantiesList {...warranties} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
