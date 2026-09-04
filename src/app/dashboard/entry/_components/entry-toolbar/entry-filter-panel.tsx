"use client";

import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  searchEntryFilterCarriers,
  searchEntryFilterSuppliers,
} from "../../_actions/entry-filter-actions";
import type {
  EntryCreateOptionDto,
  EntryOperationList,
  EntrySearchParams,
} from "../types/entry-dashboard-types";
import {
  ENTRY_CATEGORY_OPTIONS,
  ENTRY_MODEL_OPTIONS,
  ENTRY_OPERATION_LIST_OPTIONS,
} from "../types/entry-dashboard-types";
import { EntryFilterCombobox } from "./entry-filter-combobox";

const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function parseIsoDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface DateFilterInputProps {
  id: string;
  label: string;
  value: string;
  min?: string;
  max?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function DateFilterInput({
  id,
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: DateFilterInputProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseIsoDate(value);
  const minDate = min ? parseIsoDate(min) : undefined;
  const maxDate = max ? parseIsoDate(max) : undefined;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-10 w-full justify-start px-3 font-normal"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="truncate">
              {selectedDate
                ? new Intl.DateTimeFormat("pt-BR").format(selectedDate)
                : "Selecione"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            locale={ptBR}
            disabled={(date) =>
              (minDate !== undefined && date < minDate) ||
              (maxDate !== undefined && date > maxDate)
            }
            onSelect={(date) => {
              if (!date) return;
              onChange(formatDateToIso(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface EntryFilterPanelProps {
  state: EntrySearchParams;
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
  pending: boolean;
  onChange: (patch: Partial<EntrySearchParams>) => void;
}

/**
 * Conteudo do painel lateral de filtros da central de entradas. Todos os
 * filtros sao aplicados imediatamente na URL, exceto o periodo, que fica em
 * rascunho e exige um botao proprio com intervalo valido. Ordenacao e
 * quantidade de registros por pagina permanecem como ultimos campos da area
 * rolavel.
 */
export function EntryFilterPanel({
  state,
  supplierOptions,
  carrierOptions,
  pending,
  onChange,
}: EntryFilterPanelProps) {
  const [draftOperation, setDraftOperation] = useState(state.operationList);
  const [draftStartDate, setDraftStartDate] = useState(state.startDate);
  const [draftEndDate, setDraftEndDate] = useState(state.endDate);
  const isPeriodDirtyRef = useRef(false);

  useEffect(() => {
    if (isPeriodDirtyRef.current) return;
    setDraftOperation(state.operationList);
    setDraftStartDate(state.startDate);
    setDraftEndDate(state.endDate);
  }, [state.operationList, state.startDate, state.endDate]);

  const hasValidDraftPeriod =
    draftStartDate !== "" &&
    draftEndDate !== "" &&
    draftStartDate <= draftEndDate;

  const handleOperationChange = (next: EntryOperationList) => {
    if (next === 0) {
      isPeriodDirtyRef.current = false;
      setDraftOperation(0);
      setDraftStartDate("");
      setDraftEndDate("");
      onChange({ operationList: 0, startDate: "", endDate: "" });
      return;
    }

    setDraftOperation(next);
    if (hasValidDraftPeriod) {
      isPeriodDirtyRef.current = false;
      onChange({
        operationList: next,
        startDate: draftStartDate,
        endDate: draftEndDate,
      });
    } else {
      isPeriodDirtyRef.current = true;
    }
  };

  const applyPeriod = () => {
    if (draftOperation === 0 || !hasValidDraftPeriod) return;
    isPeriodDirtyRef.current = false;
    onChange({
      operationList: draftOperation,
      startDate: draftStartDate,
      endDate: draftEndDate,
    });
  };

  return (
    <div className="space-y-4">
      <EntryFilterCombobox
        id="entry-filter-supplier"
        label="Fornecedor"
        value={state.supplierId}
        options={supplierOptions}
        placeholder="Todos"
        searchPlaceholder="Pesquisar fornecedor..."
        emptyMessage="Nenhum fornecedor encontrado."
        disabled={pending}
        onValueChange={(supplierId) => onChange({ supplierId })}
        onSearch={searchEntryFilterSuppliers}
      />

      <EntryFilterCombobox
        id="entry-filter-carrier"
        label="Transportadora"
        value={state.carrierId}
        options={carrierOptions}
        placeholder="Todos"
        searchPlaceholder="Pesquisar transportadora..."
        emptyMessage="Nenhuma transportadora encontrada."
        disabled={pending}
        onValueChange={(carrierId) => onChange({ carrierId })}
        onSearch={searchEntryFilterCarriers}
      />

      <div className="space-y-2">
        <Label htmlFor="entry-filter-model">Modelo</Label>
        <select
          id="entry-filter-model"
          className={SELECT_CLASS}
          value={state.modelId}
          disabled={pending}
          onChange={(event) =>
            onChange({ modelId: Number(event.target.value) as 0 | 1 | 2 })
          }
        >
          {ENTRY_MODEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry-filter-category">Categoria</Label>
        <select
          id="entry-filter-category"
          className={SELECT_CLASS}
          value={state.categoryId}
          disabled={pending}
          onChange={(event) =>
            onChange({ categoryId: Number(event.target.value) as 0 | 1 })
          }
        >
          {ENTRY_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 rounded-md border p-3">
        <Label htmlFor="entry-filter-operation-list">Período</Label>
        <select
          id="entry-filter-operation-list"
          className={SELECT_CLASS}
          value={draftOperation}
          disabled={pending}
          onChange={(event) =>
            handleOperationChange(
              Number(event.target.value) as EntryOperationList,
            )
          }
        >
          {ENTRY_OPERATION_LIST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <DateFilterInput
            id="entry-filter-start-date"
            label="Data inicial"
            value={draftStartDate}
            max={draftEndDate || undefined}
            disabled={pending}
            onChange={(value) => {
              isPeriodDirtyRef.current = true;
              setDraftStartDate(value);
            }}
          />
          <DateFilterInput
            id="entry-filter-end-date"
            label="Data final"
            value={draftEndDate}
            min={draftStartDate || undefined}
            disabled={pending}
            onChange={(value) => {
              isPeriodDirtyRef.current = true;
              setDraftEndDate(value);
            }}
          />
        </div>
        {draftOperation > 0 && (
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={pending || !hasValidDraftPeriod}
            onClick={applyPeriod}
          >
            Aplicar período
          </Button>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="entry-sort">Ordenar por</Label>
            <select
              id="entry-sort"
              className={SELECT_CLASS}
              value={state.sort}
              disabled={pending}
              onChange={(event) =>
                onChange({
                  sort: event.target.value as EntrySearchParams["sort"],
                })
              }
            >
              <option value="entry-date">Data de entrada</option>
              <option value="id">ID</option>
              <option value="created-at">Data de cadastro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry-order">Direção</Label>
            <select
              id="entry-order"
              className={SELECT_CLASS}
              value={state.order}
              disabled={pending}
              onChange={(event) =>
                onChange({
                  order: event.target.value as EntrySearchParams["order"],
                })
              }
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry-limit">Registros por página</Label>
          <select
            id="entry-limit"
            className={SELECT_CLASS}
            value={state.limit}
            disabled={pending}
            onChange={(event) =>
              onChange({
                limit: Number(event.target.value) as EntrySearchParams["limit"],
              })
            }
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
