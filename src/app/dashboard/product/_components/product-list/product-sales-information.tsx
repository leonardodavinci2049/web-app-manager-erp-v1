import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";

type ProductSales = Pick<
  UIProductManager,
  | "salesTwoMonthsAgo"
  | "salesPreviousMonth"
  | "salesCurrentMonth"
  | "lastSaleAt"
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
 * Mantem cada periodo em uma linha para preservar a legibilidade em cards
 * estreitos.
 */
export function ProductSalesInformation({
  product,
}: ProductSalesInformationProps) {
  return (
    <div className="border-y py-1 text-[10px] leading-tight sm:text-xs">
      <p className="font-medium">Vendas</p>
      <dl className="mt-0.5 space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="min-w-0 text-muted-foreground">Há 2 meses</dt>
          <dd className="shrink-0 font-medium tabular-nums">
            {formatSalesQuantity(product.salesTwoMonthsAgo)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="min-w-0 text-muted-foreground">Mês anterior</dt>
          <dd className="shrink-0 font-medium tabular-nums">
            {formatSalesQuantity(product.salesPreviousMonth)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="min-w-0 text-muted-foreground">Mês atual</dt>
          <dd className="shrink-0 font-medium tabular-nums">
            {formatSalesQuantity(product.salesCurrentMonth)}
          </dd>
        </div>
      </dl>

      <p className="mt-1 text-muted-foreground">
        Últ. venda:{" "}
        <span className="font-medium text-foreground">
          {formatLastSaleDate(product.lastSaleAt)}
        </span>
      </p>
    </div>
  );
}
