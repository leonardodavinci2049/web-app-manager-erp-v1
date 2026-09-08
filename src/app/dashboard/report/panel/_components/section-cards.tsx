import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/common-utils";
import type { ReportSummary } from "../_lib/report";

export function SectionCards({ summary }: { summary: ReportSummary }) {
  const cards = [
    {
      title: "Pedidos",
      value: summary.orderCount.toLocaleString("pt-BR"),
      detail: "Pedidos únicos no período",
    },
    {
      title: "Itens dos pedidos",
      value: summary.items.toLocaleString("pt-BR"),
      detail: `${summary.products.toLocaleString("pt-BR")} produtos vendidos`,
    },
    {
      title: "Ticket médio",
      value: formatCurrency(summary.average / 100),
      detail: "Valor médio por pedido",
    },
    {
      title: "Total vendido",
      value: formatCurrency(summary.total / 100),
      detail: "Soma dos totais dos pedidos",
    },
  ];
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="min-w-0 gap-1.5 py-3 sm:gap-3 sm:py-6"
        >
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-xs leading-snug text-muted-foreground sm:text-sm">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <p className="break-words text-lg font-semibold tabular-nums sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-1 text-xs font-medium sm:mt-2 sm:text-sm">
              {card.detail}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
