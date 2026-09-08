"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { RegistryFilterSheet } from "@/app/dashboard/_components/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  displayDate,
  maxEndDate,
  type Period,
  validatePeriod,
} from "../_lib/period";

export function PeriodFilter({
  period,
  presets,
  children,
}: {
  period: Period;
  presets: (Period & { label: string })[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(period.start);
  const [end, setEnd] = useState(period.end);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function apply(next: Period) {
    try {
      validatePeriod(next);
    } catch {
      setError(
        "Informe datas válidas, em ordem, com no máximo 12 meses inclusivos.",
      );
      return;
    }
    setError("");
    setStart(next.start);
    setEnd(next.end);
    setOpen(false);
    startTransition(() =>
      router.push(`/dashboard/report/panel?${new URLSearchParams(next)}`),
    );
  }
  let maximum: string | undefined;
  try {
    maximum = maxEndDate(start);
  } catch {
    maximum = undefined;
  }
  return (
    <div className="min-w-0 space-y-3 sm:space-y-6" aria-busy={pending}>
      <div className="flex items-center justify-between gap-1 sm:gap-3">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              className="h-11 px-2 text-xs sm:h-9 sm:px-4 sm:text-sm"
              variant={
                period.start === preset.start && period.end === preset.end
                  ? "secondary"
                  : "outline"
              }
              aria-pressed={
                period.start === preset.start && period.end === preset.end
              }
              disabled={pending}
              onClick={() => apply({ start: preset.start, end: preset.end })}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 gap-1 px-2 text-xs sm:gap-2 sm:px-4 sm:text-sm md:hidden"
          disabled={pending}
          onClick={() => {
            setStart(period.start);
            setEnd(period.end);
            setError("");
            setOpen(true);
          }}
        >
          <Filter className="size-4" aria-hidden="true" />
          Filtros
        </Button>
        <RegistryFilterSheet
          open={open}
          pending={pending}
          activeCount={
            period.start !== presets[0].start || period.end !== presets[0].end
              ? 1
              : 0
          }
          hasChanges={start !== period.start || end !== period.end}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setStart(period.start);
              setEnd(period.end);
              setError("");
            }
            setOpen(nextOpen);
          }}
          onApply={() => apply({ start, end })}
          onClear={() =>
            apply({ start: presets[0].start, end: presets[0].end })
          }
        >
          <form
            id="sales-period-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              apply({ start, end });
            }}
          >
            <fieldset
              disabled={pending}
              className="min-w-0 space-y-4 rounded-md border p-3"
            >
              <legend className="px-1 text-sm font-medium">
                Período por data do pedido
              </legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  htmlFor="sales-period-start"
                  className="min-w-0 space-y-2 text-sm"
                >
                  Data inicial
                  <Input
                    id="sales-period-start"
                    className="w-full"
                    type="date"
                    required
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </label>
                <label
                  htmlFor="sales-period-end"
                  className="min-w-0 space-y-2 text-sm"
                >
                  Data final
                  <Input
                    id="sales-period-end"
                    className="w-full"
                    type="date"
                    required
                    min={start}
                    max={maximum}
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </label>
              </div>
            </fieldset>
            <p className="text-sm text-muted-foreground">
              Até 12 meses, incluindo as datas inicial e final. O atalho de 30
              dias inclui hoje e os 30 dias anteriores.
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        </RegistryFilterSheet>
      </div>
      {pending ? (
        <p role="status" className="py-12 text-center">
          Carregando todos os pedidos do período…
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Período solicitado: {displayDate(period.start)} a{" "}
            {displayDate(period.end)} · Pedidos com status Venda (14)
          </p>
          {children}
        </>
      )}
    </div>
  );
}
