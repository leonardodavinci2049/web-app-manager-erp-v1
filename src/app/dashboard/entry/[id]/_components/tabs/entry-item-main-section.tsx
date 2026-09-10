"use client";

import { Check, ClipboardList, Loader2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import type { EntryItemDetailDto } from "../../_actions/entry-item-actions";
import { updateEntryItemMainAction } from "../../_actions/entry-item-update-actions";
import {
  parseEntryDecimalInput,
  sanitizeEntryDecimalInput,
  toEntryDecimalInput,
} from "../entry-decimal-input";
import { EntryDetailField } from "../entry-detail-field";
import { ENTRY_CLOSED_EDIT_MESSAGE } from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";
import { EntryItemSectionEditAction } from "./entry-item-section-edit-action";

const INTEGER_FIELDS = [
  ["purchasedQuantity", "Quantidade comprada"],
  ["receivedQuantity", "Quantidade recebida"],
] as const;

const DECIMAL_FIELDS = [
  ["unitValue", "Valor unitário (R$)"],
  ["freightValue", "Frete (R$)"],
  ["invoiceValue", "Valor da nota (R$)"],
] as const;

type IntegerField = (typeof INTEGER_FIELDS)[number][0];
type DecimalField = (typeof DECIMAL_FIELDS)[number][0];

interface EntryItemMainFormValues {
  purchasedQuantity: string;
  receivedQuantity: string;
  unitValue: string;
  freightValue: string;
  invoiceValue: string;
}

interface EntryItemMainSectionProps {
  entryId: number;
  isStockClosed: boolean;
  detail: EntryItemDetailDto;
  onSaved: () => void;
  onEntryClosed: () => void;
}

function sanitizeQuantityInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 9);
}

function parseQuantity(value: string): number {
  if (!value) return Number.NaN;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
}

function toFormValues(detail: EntryItemDetailDto): EntryItemMainFormValues {
  return {
    purchasedQuantity: String(detail.purchasedQuantity ?? 0),
    receivedQuantity: String(detail.receivedQuantity ?? 0),
    unitValue: toEntryDecimalInput(detail.unitValue),
    freightValue: toEntryDecimalInput(detail.freightValue),
    invoiceValue: toEntryDecimalInput(detail.invoiceValue),
  };
}

export function EntryItemMainSection({
  entryId,
  isStockClosed,
  detail,
  onSaved,
  onEntryClosed,
}: EntryItemMainSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<EntryItemMainFormValues>(() =>
    toFormValues(detail),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const resetForm = () => {
    setValues(toFormValues(detail));
    setFieldErrors({});
  };

  const handleEdit = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const setField = (field: keyof EntryItemMainFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) return;

    if (isStockClosed) {
      toast.error(ENTRY_CLOSED_EDIT_MESSAGE);
      setIsEditing(false);
      return;
    }

    const parsedQuantities: Record<IntegerField, number> = {
      purchasedQuantity: parseQuantity(values.purchasedQuantity),
      receivedQuantity: parseQuantity(values.receivedQuantity),
    };
    const parsedDecimals: Record<DecimalField, number> = {
      unitValue: parseEntryDecimalInput(values.unitValue),
      freightValue: parseEntryDecimalInput(values.freightValue),
      invoiceValue: parseEntryDecimalInput(values.invoiceValue),
    };

    const invalidIntegerField = INTEGER_FIELDS.find(
      ([field]) =>
        !Number.isFinite(parsedQuantities[field]) ||
        parsedQuantities[field] < 0,
    );

    if (invalidIntegerField) {
      const message = `Informe uma quantidade inteira e não negativa para ${invalidIntegerField[1].toLowerCase()}.`;
      setFieldErrors((current) => ({
        ...current,
        [invalidIntegerField[0]]: [message],
      }));
      toast.error(message);
      return;
    }

    const invalidDecimalField = DECIMAL_FIELDS.find(
      ([field]) =>
        !Number.isFinite(parsedDecimals[field]) || parsedDecimals[field] < 0,
    );

    if (invalidDecimalField) {
      const message = `Informe um valor numérico válido e não negativo para ${invalidDecimalField[1].toLowerCase()}.`;
      setFieldErrors((current) => ({
        ...current,
        [invalidDecimalField[0]]: [message],
      }));
      toast.error(message);
      return;
    }

    const hasChanges =
      parsedQuantities.purchasedQuantity !== detail.purchasedQuantity ||
      parsedQuantities.receivedQuantity !== detail.receivedQuantity ||
      parsedDecimals.unitValue !== Number(detail.unitValue) ||
      parsedDecimals.freightValue !== Number(detail.freightValue) ||
      parsedDecimals.invoiceValue !== Number(detail.invoiceValue);

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryItemMainAction({
        entryId,
        itemId: detail.itemId,
        purchasedQuantity: parsedQuantities.purchasedQuantity,
        receivedQuantity: parsedQuantities.receivedQuantity,
        unitValue: parsedDecimals.unitValue,
        freightValue: parsedDecimals.freightValue,
        invoiceValue: parsedDecimals.invoiceValue,
      });

      if (!result.success) {
        if (result.entryClosed) {
          setIsEditing(false);
          onEntryClosed();
        }
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsEditing(false);
      onSaved();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntrySectionCard
      icon={
        <ClipboardList className="text-primary size-4" aria-hidden="true" />
      }
      title="Informações do item"
      action={
        !isEditing ? (
          <EntryItemSectionEditAction
            isStockClosed={isStockClosed}
            label="informações do item"
            onEdit={handleEdit}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {INTEGER_FIELDS.map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`entry-item-main-${field}`}>{label}</Label>
                  <Input
                    id={`entry-item-main-${field}`}
                    inputMode="numeric"
                    value={values[field]}
                    onChange={(event) =>
                      setField(field, sanitizeQuantityInput(event.target.value))
                    }
                    placeholder="0"
                    required
                    aria-invalid={Boolean(fieldErrors[field]?.length)}
                  />
                  {fieldErrors[field]?.[0] ? (
                    <p className="text-destructive text-xs">
                      {fieldErrors[field][0]}
                    </p>
                  ) : null}
                </div>
              ))}
              {DECIMAL_FIELDS.map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`entry-item-main-${field}`}>{label}</Label>
                  <Input
                    id={`entry-item-main-${field}`}
                    inputMode="decimal"
                    value={values[field]}
                    onChange={(event) =>
                      setField(
                        field,
                        sanitizeEntryDecimalInput(event.target.value),
                      )
                    }
                    placeholder="0,00"
                    required
                    aria-invalid={Boolean(fieldErrors[field]?.length)}
                  />
                  {fieldErrors[field]?.[0] ? (
                    <p className="text-destructive text-xs">
                      {fieldErrors[field][0]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Use vírgula para separar as casas decimais.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="size-4" aria-hidden="true" />
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </fieldset>
        </form>
      ) : (
        <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <EntryDetailField
            label="Quantidade comprada"
            value={formatEntryNumber(String(detail.purchasedQuantity))}
          />
          <EntryDetailField
            label="Quantidade recebida"
            value={formatEntryNumber(String(detail.receivedQuantity))}
          />
          <EntryDetailField
            label="Valor unitário"
            value={formatEntryMoney(detail.unitValue)}
          />
          <EntryDetailField
            label="Frete"
            value={formatEntryMoney(detail.freightValue)}
          />
          <EntryDetailField
            label="Valor da nota"
            value={formatEntryMoney(detail.invoiceValue)}
          />
        </dl>
      )}
    </EntrySectionCard>
  );
}
