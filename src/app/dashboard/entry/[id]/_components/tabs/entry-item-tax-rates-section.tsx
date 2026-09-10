"use client";

import { Check, Loader2, Percent, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEntryMoney } from "../../../_components/lib/format";
import type { EntryItemDetailDto } from "../../_actions/entry-item-actions";
import { updateEntryItemTaxRatesAction } from "../../_actions/entry-item-update-actions";
import {
  parseEntryDecimalInput,
  sanitizeEntryDecimalInput,
  toEntryDecimalInput,
} from "../entry-decimal-input";
import { EntryDetailField } from "../entry-detail-field";
import { ENTRY_CLOSED_EDIT_MESSAGE } from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";
import { EntryItemSectionEditAction } from "./entry-item-section-edit-action";

const TAX_RATE_FIELDS = [
  ["baseIcms", "Base ICMS (R$)"],
  ["valueIcms", "Valor ICMS (R$)"],
  ["baseIpi", "Base IPI (R$)"],
  ["valueIpi", "Valor IPI (R$)"],
  ["baseSt", "Base ST (R$)"],
  ["valueSt", "Valor ST (R$)"],
  ["baseIbs", "Base IBS (R$)"],
  ["valueIbs", "Valor IBS (R$)"],
  ["baseCbs", "Base CBS (R$)"],
  ["valueCbs", "Valor CBS (R$)"],
] as const;

type TaxRateField = (typeof TAX_RATE_FIELDS)[number][0];

type EntryItemTaxRatesFormValues = Record<TaxRateField, string>;

interface EntryItemTaxRatesSectionProps {
  entryId: number;
  isStockClosed: boolean;
  detail: EntryItemDetailDto;
  onSaved: () => void;
  onEntryClosed: () => void;
}

function toFormValues(detail: EntryItemDetailDto): EntryItemTaxRatesFormValues {
  return {
    baseIcms: toEntryDecimalInput(detail.baseIcms),
    valueIcms: toEntryDecimalInput(detail.valueIcms),
    baseIpi: toEntryDecimalInput(detail.baseIpi),
    valueIpi: toEntryDecimalInput(detail.valueIpi),
    baseSt: toEntryDecimalInput(detail.baseSt),
    valueSt: toEntryDecimalInput(detail.valueSt),
    baseIbs: toEntryDecimalInput(detail.baseIbs),
    valueIbs: toEntryDecimalInput(detail.valueIbs),
    baseCbs: toEntryDecimalInput(detail.baseCbs),
    valueCbs: toEntryDecimalInput(detail.valueCbs),
  };
}

export function EntryItemTaxRatesSection({
  entryId,
  isStockClosed,
  detail,
  onSaved,
  onEntryClosed,
}: EntryItemTaxRatesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<EntryItemTaxRatesFormValues>(() =>
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

  const setField = (field: TaxRateField, value: string) => {
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

    const parsedValues: Record<TaxRateField, number> = {
      baseIcms: parseEntryDecimalInput(values.baseIcms),
      valueIcms: parseEntryDecimalInput(values.valueIcms),
      baseIpi: parseEntryDecimalInput(values.baseIpi),
      valueIpi: parseEntryDecimalInput(values.valueIpi),
      baseSt: parseEntryDecimalInput(values.baseSt),
      valueSt: parseEntryDecimalInput(values.valueSt),
      baseIbs: parseEntryDecimalInput(values.baseIbs),
      valueIbs: parseEntryDecimalInput(values.valueIbs),
      baseCbs: parseEntryDecimalInput(values.baseCbs),
      valueCbs: parseEntryDecimalInput(values.valueCbs),
    };

    const invalidField = TAX_RATE_FIELDS.find(
      ([field]) =>
        !Number.isFinite(parsedValues[field]) || parsedValues[field] < 0,
    );

    if (invalidField) {
      const message = `Informe um valor válido e não negativo para ${invalidField[1].toLowerCase()}.`;
      setFieldErrors((current) => ({
        ...current,
        [invalidField[0]]: [message],
      }));
      toast.error(message);
      return;
    }

    const hasChanges = TAX_RATE_FIELDS.some(
      ([field]) => parsedValues[field] !== Number(detail[field]),
    );

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryItemTaxRatesAction({
        entryId,
        itemId: detail.itemId,
        baseIcms: parsedValues.baseIcms,
        valueIcms: parsedValues.valueIcms,
        baseIpi: parsedValues.baseIpi,
        valueIpi: parsedValues.valueIpi,
        baseSt: parsedValues.baseSt,
        valueSt: parsedValues.valueSt,
        baseIbs: parsedValues.baseIbs,
        valueIbs: parsedValues.valueIbs,
        baseCbs: parsedValues.baseCbs,
        valueCbs: parsedValues.valueCbs,
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
      icon={<Percent className="text-primary size-4" aria-hidden="true" />}
      title="Impostos"
      action={
        !isEditing ? (
          <EntryItemSectionEditAction
            isStockClosed={isStockClosed}
            label="impostos"
            onEdit={handleEdit}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {TAX_RATE_FIELDS.map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`entry-item-tax-rates-${field}`}>
                    {label}
                  </Label>
                  <Input
                    id={`entry-item-tax-rates-${field}`}
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
            label="Base / valor ICMS"
            value={`${formatEntryMoney(detail.baseIcms)} / ${formatEntryMoney(detail.valueIcms)}`}
          />
          <EntryDetailField
            label="Base / valor IPI"
            value={`${formatEntryMoney(detail.baseIpi)} / ${formatEntryMoney(detail.valueIpi)}`}
          />
          <EntryDetailField
            label="Base / valor IBS"
            value={`${formatEntryMoney(detail.baseIbs)} / ${formatEntryMoney(detail.valueIbs)}`}
          />
          <EntryDetailField
            label="Base / valor CBS"
            value={`${formatEntryMoney(detail.baseCbs)} / ${formatEntryMoney(detail.valueCbs)}`}
          />
          <EntryDetailField
            label="Base / valor ST"
            value={`${formatEntryMoney(detail.baseSt)} / ${formatEntryMoney(detail.valueSt)}`}
          />
        </dl>
      )}
    </EntrySectionCard>
  );
}
