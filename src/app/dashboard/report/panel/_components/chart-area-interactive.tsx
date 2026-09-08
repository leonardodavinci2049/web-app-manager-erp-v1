"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/utils/common-utils";
import { displayDate } from "../_lib/period";
import type { ValueGroup } from "../_lib/report";

export function ChartAreaInteractive({
  series,
  granularity,
}: {
  series: ValueGroup[];
  granularity: string;
}) {
  const data = series.map((point) => ({
    ...point,
    label: point.label.split(" / ").map(displayDate).join(" a "),
    value: point.value / 100,
  }));
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Histórico de vendas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Agrupamento {granularity.toLocaleLowerCase("pt-BR")} · Valor total por
          data do pedido
        </p>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer
          config={{ value: { label: "Vendas", color: "var(--chart-1)" } }}
          className="h-64 w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="key"
              tickLine={false}
              axisLine={false}
              minTickGap={35}
              tickFormatter={(value: string) => displayDate(value).slice(0, 5)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload[0]?.payload.label}
                  formatter={(value) => (
                    <span className="font-medium">
                      {formatCurrency(Number(value))}
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey="value"
              type="linear"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer rounded-sm focus-visible:outline-2">
            Ver valores do histórico
          </summary>
          <dl className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
            {data.map((point) => (
              <div
                key={point.key}
                className="flex flex-wrap justify-between gap-2 border-b py-2"
              >
                <dt>{point.label}</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency(point.value)}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </CardContent>
    </Card>
  );
}
