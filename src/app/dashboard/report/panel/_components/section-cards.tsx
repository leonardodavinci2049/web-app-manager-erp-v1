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
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="min-w-0 gap-3">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words text-2xl font-semibold tabular-nums">
              {card.value}
            </p>
            <p className="mt-2 text-sm font-medium">{card.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
