"use client";

import { Check, Edit2, Loader2, Percent, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { formatEntryMoney } from "../../../_components/lib/format";
import { updateEntryTaxRatesAction } from "../../_actions/entry-detail-actions";
import {
  parseEntryDecimalInput,
  sanitizeEntryDecimalInput,
  toEntryDecimalInput,
} from "../entry-decimal-input";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntryTaxesTabProps {
  entry: UIEntryDetail;
}

const TAX_FIELDS = [
  { name: "icmsValue", label: "Valor de ICMS" },
  { name: "ipiValue", label: "Valor de IPI" },
  { name: "pisValue", label: "Valor de PIS" },
  { name: "cofinsValue", label: "Valor de COFINS" },
  { name: "ibsValue", label: "Valor de IBS" },
  { name: "cbsValue", label: "Valor de CBS" },
] as const;

type TaxField = (typeof TAX_FIELDS)[number]["name"];
type TaxFormValues = Record<TaxField, string>;
type ParsedTaxValues = Record<TaxField, number>;

function toFormValues(entry: UIEntryDetail): TaxFormValues {
  return {
    icmsValue: toEntryDecimalInput(entry.icmsValue),
    ipiValue: toEntryDecimalInput(entry.ipiValue),
    pisValue: toEntryDecimalInput(entry.pisValue),
    cofinsValue: toEntryDecimalInput(entry.cofinsValue),
    ibsValue: toEntryDecimalInput(entry.ibsValue),
    cbsValue: toEntryDecimalInput(entry.cbsValue),
  };
}

export function EntryTaxesTab({ entry }: EntryTaxesTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<TaxFormValues>(() =>
    toFormValues(entry),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const resetForm = () => {
    setValues(toFormValues(entry));
    setFieldErrors({});
  };

  const setField = (field: TaxField, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: sanitizeEntryDecimalInput(value),
    }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedValues: ParsedTaxValues = {
      icmsValue: parseEntryDecimalInput(values.icmsValue),
      ipiValue: parseEntryDecimalInput(values.ipiValue),
      pisValue: parseEntryDecimalInput(values.pisValue),
      cofinsValue: parseEntryDecimalInput(values.cofinsValue),
      ibsValue: parseEntryDecimalInput(values.ibsValue),
      cbsValue: parseEntryDecimalInput(values.cbsValue),
    };
    const invalidField = TAX_FIELDS.find(
      ({ name }) =>
        !Number.isFinite(parsedValues[name]) || parsedValues[name] < 0,
    );

    if (invalidField) {
      const message = `Informe um valor válido e não negativo para ${invalidField.label.toLowerCase()}.`;
      setFieldErrors((current) => ({
        ...current,
        [invalidField.name]: [message],
      }));
      toast.error(message);
      return;
    }

    const hasChanges = TAX_FIELDS.some(
      ({ name }) => parsedValues[name] !== Number(entry[name]),
    );

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryTaxRatesAction({
        entryId: entry.id,
        ...parsedValues,
      });

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntrySectionCard
      icon={<Percent className="size-4" />}
      title="Tributos"
      action={
        !isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            onClick={() => {
              resetForm();
              setIsEditing(true);
            }}
          >
            <Edit2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
            <span className="sr-only sm:hidden">Editar tributos</span>
          </Button>
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {TAX_FIELDS.map(({ name, label }) => (
                <div key={name} className="space-y-2">
                  <Label htmlFor={`entry-taxes-${name}`}>{label}</Label>
                  <Input
                    id={`entry-taxes-${name}`}
                    inputMode="decimal"
                    value={values[name]}
                    onChange={(event) => setField(name, event.target.value)}
                    placeholder="0,00"
                    required
                    aria-invalid={Boolean(fieldErrors[name]?.length)}
                  />
                  {fieldErrors[name]?.[0] ? (
                    <p className="text-destructive text-xs">
                      {fieldErrors[name][0]}
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
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
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
        <dl className="grid gap-4 sm:grid-cols-2">
          {TAX_FIELDS.map(({ name, label }) => (
            <EntryDetailField
              key={name}
              label={label}
              value={formatEntryMoney(entry[name])}
            />
          ))}
        </dl>
      )}
    </EntrySectionCard>
  );
}
