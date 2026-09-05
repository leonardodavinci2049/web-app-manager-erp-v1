import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";

type ProductSales = Pick<
  UIProductManager,
  "salesTwoMonthsAgo" | "salesLast30Days" | "salesCurrentMonth" | "lastSaleAt"
>;

const SALES_QUANTITY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export function formatSalesQuantity(value?: number): string {
  return SALES_QUANTITY_FORMATTER.format(
    Number.isFinite(value) ? Math.max(0, value ?? 0) : 0,
  );
}

export function formatLastSaleDate(value?: string): string {
  if (!value) return "—";

  const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!dateParts) return "—";

  const [, year, month, day] = dateParts;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const isValidDate =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);

  return isValidDate ? `${day}/${month}/${year}` : "—";
}

interface ProductSalesInformationProps {
  product: ProductSales;
}

/**
 * Resumo compacto de vendas para os cards do catalogo (Server Component).
 * Mantem os periodos de vendas em colunas antes da informacao de estoque.
 */
export function ProductSalesInformation({
  product,
}: ProductSalesInformationProps) {
  return (
    <div className="border-y py-1 text-[10px] leading-tight sm:text-xs">
      <div className="grid grid-cols-[minmax(2.75rem,auto)_repeat(3,minmax(0,1fr))] items-end gap-x-0.5 text-center">
        <span className="text-left font-medium">Vendas</span>
        <span className="whitespace-nowrap text-muted-foreground tracking-tight">
          Há 2 meses
        </span>
        <span className="whitespace-nowrap text-muted-foreground tracking-tight">
          30 dias
        </span>
        <span className="whitespace-nowrap text-muted-foreground tracking-tight">
          Mês atual
        </span>

        <span className="text-left text-muted-foreground">Total:</span>
        <span className="font-medium">
          {formatSalesQuantity(product.salesTwoMonthsAgo)}
        </span>
        <span className="font-medium">
          {formatSalesQuantity(product.salesLast30Days)}
        </span>
        <span className="font-medium">
          {formatSalesQuantity(product.salesCurrentMonth)}
        </span>
      </div>

      <p className="mt-1 text-muted-foreground">
        Últ. venda:{" "}
        <span className="font-medium text-foreground">
          {formatLastSaleDate(product.lastSaleAt)}
        </span>
      </p>
    </div>
  );
}
