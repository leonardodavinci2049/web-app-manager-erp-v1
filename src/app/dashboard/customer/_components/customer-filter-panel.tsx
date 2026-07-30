"use client";

import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { countCustomerFilters } from "./lib/search-params";
import type {
  CustomerOperation,
  CustomerOrder,
  CustomerPageLimit,
  CustomerSearchParams,
  CustomerSort,
  CustomerTriState,
} from "./types/customer-dashboard-types";

const SELECT_CLASS =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface CustomerFilterPanelProps {
  filters: CustomerSearchParams;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: CustomerSearchParams) => void;
  onClear: () => void;
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2" aria-label={title}>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-wide uppercase">
          {title}
        </span>
        <Separator />
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function NumericField({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value || ""}
        placeholder="0 — Todos"
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") onChange(0);
          else if (/^\d+$/.test(raw)) onChange(Number(raw));
        }}
      />
    </div>
  );
}

function TriStateField({
  id,
  label,
  value,
  first,
  second,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: CustomerTriState;
  first: string;
  second: string;
  disabled: boolean;
  onChange: (value: CustomerTriState) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={SELECT_CLASS}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(Number(event.target.value) as CustomerTriState)
        }
      >
        <option value={0}>Todos</option>
        <option value={1}>{first}</option>
        <option value={2}>{second}</option>
      </select>
    </div>
  );
}

export function CustomerFilterPanel({
  filters,
  open,
  pending,
  onOpenChange,
  onApply,
  onClear,
}: CustomerFilterPanelProps) {
  const [draft, setDraft] = useState(filters);
  useEffect(() => setDraft(filters), [filters]);
  const filterCount = countCustomerFilters(filters);
  const periodInvalid =
    draft.operation === 7 &&
    (draft.startDate === "" ||
      draft.endDate === "" ||
      draft.startDate > draft.endDate);
  const hasDraftChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(filters),
    [draft, filters],
  );

  const updateDraft = <Key extends keyof CustomerSearchParams>(
    key: Key,
    value: CustomerSearchParams[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraft(filters);
        onOpenChange(nextOpen);
      }}
    >
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={filterCount > 0 ? "default" : "outline"}
          className="hidden h-11 shrink-0 gap-1.5 px-3 shadow-sm sm:px-4 md:inline-flex"
        >
          <Filter className="size-4" />
          <span className="hidden sm:inline">Filtros e ordenação</span>
          {filterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center px-1.5 text-xs"
            >
              {filterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[92vw] max-w-[92vw] flex-col gap-0 p-0 sm:w-full sm:max-w-md"
      >
        <SheetHeader className="border-b p-4 pr-12">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="size-4" />
            Filtros e ordenação
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="register" className="min-h-0 flex-1 gap-0">
          <div className="border-b px-3 py-2">
            <TabsList className="grid h-9 w-full grid-cols-3">
              <TabsTrigger value="register">Cadastro</TabsTrigger>
              <TabsTrigger value="status">Situação</TabsTrigger>
              <TabsTrigger value="period">Período</TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <TabsContent value="register" className="space-y-4">
              <FilterGroup title="Classificação">
                <div className="grid grid-cols-2 gap-2">
                  <NumericField
                    id="customer-category"
                    label="ID da categoria"
                    value={draft.categoryId}
                    disabled={pending}
                    onChange={(value) => updateDraft("categoryId", value)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="customer-client-type">
                      Tipo de cliente
                    </Label>
                    <select
                      id="customer-client-type"
                      className={SELECT_CLASS}
                      value={draft.clientType}
                      disabled={pending}
                      onChange={(event) =>
                        updateDraft("clientType", Number(event.target.value))
                      }
                    >
                      <option value={0}>Todos</option>
                      <option value={1}>Atacado</option>
                      <option value={2}>Varejo</option>
                      <option value={3}>Não informado</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customer-person-type">Tipo de pessoa</Label>
                  <select
                    id="customer-person-type"
                    className={SELECT_CLASS}
                    value={draft.personType}
                    disabled={pending}
                    onChange={(event) =>
                      updateDraft("personType", Number(event.target.value))
                    }
                  >
                    <option value={0}>Todos</option>
                    <option value={1}>Pessoa física</option>
                    <option value={2}>Pessoa jurídica</option>
                  </select>
                </div>
              </FilterGroup>

              <FilterGroup title="Perfil">
                <TriStateField
                  id="customer-approved"
                  label="Aprovação"
                  value={draft.approved}
                  first="Não aprovados"
                  second="Aprovados"
                  disabled={pending}
                  onChange={(value) => updateDraft("approved", value)}
                />
                <TriStateField
                  id="customer-gender"
                  label="Gênero"
                  value={draft.gender}
                  first="Masculino"
                  second="Feminino"
                  disabled={pending}
                  onChange={(value) => updateDraft("gender", value)}
                />
                <label
                  htmlFor="customer-no-image"
                  className="flex min-h-10 items-center justify-between gap-3 rounded-md border px-3"
                >
                  <span className="text-sm">Somente sem imagem</span>
                  <Checkbox
                    id="customer-no-image"
                    checked={draft.noImage}
                    disabled={pending}
                    onCheckedChange={(checked) =>
                      updateDraft("noImage", checked === true)
                    }
                  />
                </label>
              </FilterGroup>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <FilterGroup title="Situação do cadastro">
                <TriStateField
                  id="customer-restricted"
                  label="Restrição"
                  value={draft.restricted}
                  first="Sem restrição"
                  second="Com restrição"
                  disabled={pending}
                  onChange={(value) => updateDraft("restricted", value)}
                />
                <TriStateField
                  id="customer-enabled"
                  label="Habilitação"
                  value={draft.enabled}
                  first="Inativos"
                  second="Ativos"
                  disabled={pending}
                  onChange={(value) => updateDraft("enabled", value)}
                />
                <NumericField
                  id="customer-status"
                  label="ID do status do cliente"
                  value={draft.statusId}
                  disabled={pending}
                  onChange={(value) => updateDraft("statusId", value)}
                />
              </FilterGroup>
            </TabsContent>

            <TabsContent value="period" className="space-y-4">
              <FilterGroup title="Operação e período">
                <div className="space-y-1">
                  <Label htmlFor="customer-operation">Operação</Label>
                  <select
                    id="customer-operation"
                    className={SELECT_CLASS}
                    value={draft.operation}
                    disabled={pending}
                    onChange={(event) =>
                      updateDraft(
                        "operation",
                        Number(event.target.value) as CustomerOperation,
                      )
                    }
                  >
                    <option value={0}>Todas</option>
                    <option value={1}>Sem compra</option>
                    <option value={2}>Compras nos últimos 3 meses</option>
                    <option value={3}>Compras nos últimos 6 meses</option>
                    <option value={6}>Compras no último ano</option>
                    <option value={7}>Período de cadastro</option>
                  </select>
                </div>
                {draft.operation === 7 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="customer-start-date">Data inicial</Label>
                      <Input
                        id="customer-start-date"
                        type="date"
                        value={draft.startDate}
                        max={draft.endDate || undefined}
                        disabled={pending}
                        onChange={(event) =>
                          updateDraft("startDate", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="customer-end-date">Data final</Label>
                      <Input
                        id="customer-end-date"
                        type="date"
                        value={draft.endDate}
                        min={draft.startDate || undefined}
                        disabled={pending}
                        onChange={(event) =>
                          updateDraft("endDate", event.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
                {periodInvalid && (
                  <p className="text-destructive text-xs">
                    Informe um período válido para aplicar este filtro.
                  </p>
                )}
              </FilterGroup>

              <FilterGroup title="Ordenação e página">
                <div className="space-y-1">
                  <Label htmlFor="customer-sort">Ordenar por</Label>
                  <select
                    id="customer-sort"
                    className={SELECT_CLASS}
                    value={draft.sort}
                    disabled={pending}
                    onChange={(event) =>
                      updateDraft("sort", event.target.value as CustomerSort)
                    }
                  >
                    <option value="id">ID</option>
                    <option value="name">Nome</option>
                    <option value="last-purchase">Última compra</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="customer-order">Direção</Label>
                    <select
                      id="customer-order"
                      className={SELECT_CLASS}
                      value={draft.order}
                      disabled={pending}
                      onChange={(event) =>
                        updateDraft(
                          "order",
                          event.target.value as CustomerOrder,
                        )
                      }
                    >
                      <option value="desc">Decrescente</option>
                      <option value="asc">Crescente</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-limit">Por página</Label>
                    <select
                      id="customer-limit"
                      className={SELECT_CLASS}
                      value={draft.limit}
                      disabled={pending}
                      onChange={(event) =>
                        updateDraft(
                          "limit",
                          Number(event.target.value) as CustomerPageLimit,
                        )
                      }
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </FilterGroup>
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="bg-background/95 border-t">
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={pending || filterCount === 0}
              onClick={() => {
                onClear();
                onOpenChange(false);
              }}
            >
              <RotateCcw className="size-4" />
              Limpar
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={pending || periodInvalid || !hasDraftChanges}
              onClick={() => {
                onApply({
                  ...draft,
                  startDate: draft.operation === 7 ? draft.startDate : "",
                  endDate: draft.operation === 7 ? draft.endDate : "",
                  page: 0,
                });
                onOpenChange(false);
              }}
            >
              Aplicar filtros
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
