import { CircleCheck, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIOrdersManagerStatusHistory } from "@/services/api-main/order_manager";
import { formatOrderDateTime } from "../lib/format";

interface StatusEvent {
  key: string;
  label: string;
  value: string;
  timestamp: number;
}

function getStatusEvents(history: UIOrdersManagerStatusHistory): StatusEvent[] {
  const candidates = [
    { key: "quote", label: "Orçamento", value: history.quoteAt },
    { key: "order", label: "Pedido", value: history.orderedAt },
    { key: "sale", label: "Venda", value: history.soldAt },
    { key: "payment", label: "Pagamento", value: history.paidAt },
    { key: "delivery", label: "Entrega", value: history.deliveredAt },
    { key: "reversal", label: "Estorno", value: history.reversedAt },
  ];

  return candidates
    .filter((event): event is { key: string; label: string; value: string } =>
      Boolean(event.value),
    )
    .map((event) => ({
      ...event,
      timestamp: new Date(event.value).getTime(),
    }))
    .sort((left, right) => {
      const leftTime = Number.isNaN(left.timestamp)
        ? Number.MAX_VALUE
        : left.timestamp;
      const rightTime = Number.isNaN(right.timestamp)
        ? Number.MAX_VALUE
        : right.timestamp;
      return leftTime - rightTime;
    });
}

export function OrderStatusHistorySection({
  statusHistory,
}: {
  statusHistory: UIOrdersManagerStatusHistory | null;
}) {
  const events = statusHistory ? getStatusEvents(statusHistory) : [];

  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock3 className="size-4" aria-hidden="true" />
          Histórico do pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Clock3
              className="text-muted-foreground mx-auto size-8"
              aria-hidden="true"
            />
            <p className="mt-3 font-medium">Histórico não informado.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Nenhuma data de mudança de status foi retornada para este pedido.
            </p>
          </div>
        ) : (
          <ol
            className="relative space-y-0 border-l ml-2"
            aria-label="Linha do tempo do pedido"
          >
            {events.map((event, index) => (
              <li key={event.key} className="relative pb-6 pl-6 last:pb-0">
                <span className="bg-background absolute -left-2 top-0 flex size-4 items-center justify-center rounded-full">
                  <CircleCheck
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                </span>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <p className="font-medium">{event.label}</p>
                    <p className="text-muted-foreground text-xs">
                      Etapa {index + 1} de {events.length}
                    </p>
                  </div>
                  <time
                    className="text-sm font-medium tabular-nums"
                    dateTime={event.value}
                  >
                    {formatOrderDateTime(event.value)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
