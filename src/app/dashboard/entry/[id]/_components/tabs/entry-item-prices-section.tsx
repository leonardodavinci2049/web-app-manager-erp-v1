"use client";

import { Check, Loader2, Tags, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEntryMoney } from "../../../_components/lib/format";
import type { EntryItemDetailDto } from "../../_actions/entry-item-actions";
import { updateEntryItemProductPriceAction } from "../../_actions/entry-item-update-actions";
import {
  parseEntryDecimalInput,
  sanitizeEntryDecimalInput,
  toEntryDecimalInput,
} from "../entry-decimal-input";
import { EntryDetailField } from "../entry-detail-field";
import { ENTRY_CLOSED_EDIT_MESSAGE } from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";
import { EntryItemSectionEditAction } from "./entry-item-section-edit-action";

const PRICE_FIELDS = [
  ["wholesalePrice", "Atacado (R$)"],
  ["retailPrice", "Varejo (R$)"],
  ["corporatePrice", "Corporativo (R$)"],
] as const;

type PriceField = (typeof PRICE_FIELDS)[number][0];

interface EntryItemPricesFormValues {
  wholesalePrice: string;
  retailPrice: string;
  corporatePrice: string;
}

interface EntryItemPricesSectionProps {
  entryId: number;
  isStockClosed: boolean;
  detail: EntryItemDetailDto;
  onSaved: () => void;
  onEntryClosed: () => void;
}

const MIN_PRICE = 0.1;

function toFormValues(detail: EntryItemDetailDto): EntryItemPricesFormValues {
  return {
    wholesalePrice: toEntryDecimalInput(detail.wholesalePrice),
    retailPrice: toEntryDecimalInput(detail.retailPrice),
    corporatePrice: toEntryDecimalInput(detail.corporatePrice),
  };
}

export function EntryItemPricesSection({
  entryId,
  isStockClosed,
  detail,
  onSaved,
  onEntryClosed,
}: EntryItemPricesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<EntryItemPricesFormValues>(() =>
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

  const setField = (field: PriceField, value: string) => {
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

    const parsedValues: Record<PriceField, number> = {
      wholesalePrice: parseEntryDecimalInput(values.wholesalePrice),
      retailPrice: parseEntryDecimalInput(values.retailPrice),
      corporatePrice: parseEntryDecimalInput(values.corporatePrice),
    };

    const invalidField = PRICE_FIELDS.find(
      ([field]) =>
        !Number.isFinite(parsedValues[field]) ||
        parsedValues[field] < MIN_PRICE,
    );

    if (invalidField) {
      const message = `Informe um valor a partir de R$ 0,10 para ${invalidField[1].toLowerCase()}.`;
      setFieldErrors((current) => ({
        ...current,
        [invalidField[0]]: [message],
      }));
      toast.error(message);
      return;
    }

    const hasChanges = PRICE_FIELDS.some(
      ([field]) => parsedValues[field] !== Number(detail[field]),
    );

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryItemProductPriceAction({
        entryId,
        itemId: detail.itemId,
        wholesalePrice: parsedValues.wholesalePrice,
        retailPrice: parsedValues.retailPrice,
        corporatePrice: parsedValues.corporatePrice,
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
      icon={<Tags className="text-primary size-4" aria-hidden="true" />}
      title="Preços de venda"
      action={
        !isEditing ? (
          <EntryItemSectionEditAction
            isStockClosed={isStockClosed}
            label="preços de venda"
            onEdit={handleEdit}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {PRICE_FIELDS.map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`entry-item-prices-${field}`}>{label}</Label>
                  <Input
                    id={`entry-item-prices-${field}`}
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
        <dl className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
          <EntryDetailField
            label="Atacado"
            value={formatEntryMoney(detail.wholesalePrice)}
          />
          <EntryDetailField
            label="Varejo"
            value={formatEntryMoney(detail.retailPrice)}
          />
          <EntryDetailField
            label="Corporativo"
            value={formatEntryMoney(detail.corporatePrice)}
          />
        </dl>
      )}
    </EntrySectionCard>
  );
}
