import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/common-utils";
import type { ValueGroup } from "../_lib/report";

export function ValueBreakdown({
  title,
  groups,
  total,
}: {
  title: string;
  groups: ValueGroup[];
  total: number;
}) {
  const maximum = Math.max(1, ...groups.map((group) => Math.abs(group.value)));
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem vendas no período.
          </p>
        ) : (
          <ul className="space-y-4">
            {groups.map((group) => (
              <li key={group.key} className="space-y-1 text-sm">
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                  <span className="min-w-0 break-words font-medium">
                    {group.label}
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(group.value / 100)} ·{" "}
                    {total === 0
                      ? "—"
                      : `${((group.value / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
                  </span>
                </div>
                <svg
                  viewBox="0 0 100 3"
                  preserveAspectRatio="none"
                  className="h-2 w-full rounded bg-muted"
                  aria-hidden="true"
                >
                  <rect
                    width={(Math.abs(group.value) / maximum) * 100}
                    height="3"
                    className="fill-primary"
                  />
                </svg>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
