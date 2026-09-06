import {
  CalendarClock,
  ChartNoAxesCombined,
  Package,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  UIPurchasingProduct,
  UIPurchasingRelatedCategory,
} from "@/services/api-main/purchasing/transformers/transformers";
import { formatCurrency, getMonthName } from "@/utils/common-utils";

function formatQuantity(value?: number): string {
  return (value ?? 0).toLocaleString("pt-BR");
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Não informada"
    : new Intl.DateTimeFormat("pt-BR").format(date);
}

export function PurchasingOverview({
  product,
  relatedCategories,
}: {
  product: UIPurchasingProduct;
  relatedCategories: UIPurchasingRelatedCategory[];
}) {
  const salesPeriods = [
    { label: getMonthName(-2), value: product.salesTwoMonthsAgo },
    { label: getMonthName(-1), value: product.salesPreviousMonth },
    { label: getMonthName(), value: product.salesCurrentMonth },
    { label: "Últimos 30 dias", value: product.salesLast30Days },
    { label: "Hoje", value: product.salesToday },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="size-4" aria-hidden="true" />
            Decisão de compra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">
              Fornecedor principal
            </p>
            <p className="font-medium">{product.supplier || "Não informado"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">Prazo em dias</p>
              <p className="font-medium tabular-nums">
                {product.deliveryDays ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Prazo em horas</p>
              <p className="font-medium tabular-nums">
                {product.deliveryHours ?? "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Criticidade</p>
            <Badge variant="outline" className="mt-1">
              {product.criticalityLevel?.trim() || "Não informada"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4" aria-hidden="true" />
            Estoque e preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Estoque da loja</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatQuantity(product.storeStock)}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <dt className="text-muted-foreground text-xs">Atacado</dt>
              <dd>{formatCurrency(Number(product.wholesalePrice))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Varejo</dt>
              <dd>{formatCurrency(Number(product.retailPrice))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Corporativo</dt>
              <dd>{formatCurrency(Number(product.corporatePrice))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Última venda</dt>
              <dd>{formatDate(product.lastSaleAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ChartNoAxesCombined className="size-4" aria-hidden="true" />
            Histórico de vendas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {salesPeriods.map((period) => (
            <div key={period.label}>
              <p className="text-muted-foreground text-xs">{period.label}</p>
              <p className="font-medium tabular-nums">
                {formatQuantity(period.value)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4" aria-hidden="true" />
            Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">Marca</p>
              <p>{product.brand || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tipo</p>
              <p>{product.type || "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs">Categorias</p>
            {relatedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {relatedCategories.map((category) => (
                  <Badge key={category.taxonomyId} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma categoria vinculada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
