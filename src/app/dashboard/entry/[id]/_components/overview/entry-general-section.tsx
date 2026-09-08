"use client";

import { Check, Edit2, Loader2, ReceiptText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import {
  formatEntryDateTime,
  formatEntryMoney,
  formatEntryNumber,
} from "../../../_components/lib/format";
import { updateEntryMainAction } from "../../_actions/entry-main-actions";
import {
  parseEntryDecimalInput,
  sanitizeEntryDecimalInput,
  toEntryDecimalInput,
} from "../entry-decimal-input";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";
import { EntryModelCombobox } from "./entry-model-combobox";

interface EntryGeneralSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "id"
    | "invoiceNumber"
    | "model"
    | "totalInvoice"
    | "totalProducts"
    | "freightValue"
    | "freightRate"
    | "description"
    | "updatedAt"
  >;
}

interface EntryGeneralFormValues {
  invoiceNumber: string;
  model: string;
  totalInvoice: string;
  totalProducts: string;
  freightValue: string;
  freightRate: string;
  description: string;
}

const NUMERIC_FIELDS = [
  "totalInvoice",
  "totalProducts",
  "freightValue",
  "freightRate",
] as const;

type NumericField = (typeof NUMERIC_FIELDS)[number];

function toFormValues(
  entry: EntryGeneralSectionProps["entry"],
): EntryGeneralFormValues {
  return {
    invoiceNumber: entry.invoiceNumber,
    model: entry.model,
    totalInvoice: toEntryDecimalInput(entry.totalInvoice),
    totalProducts: toEntryDecimalInput(entry.totalProducts),
    freightValue: toEntryDecimalInput(entry.freightValue),
    freightRate: toEntryDecimalInput(entry.freightRate),
    description: entry.description,
  };
}

export function EntryGeneralSection({ entry }: EntryGeneralSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<EntryGeneralFormValues>(() =>
    toFormValues(entry),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const resetForm = () => {
    setValues(toFormValues(entry));
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

  const setField = <Field extends keyof EntryGeneralFormValues>(
    field: Field,
    value: EntryGeneralFormValues[Field],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  };

  const handleNumericChange = (field: NumericField, value: string) => {
    setField(field, sanitizeEntryDecimalInput(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedNumbers = {
      totalInvoice: parseEntryDecimalInput(values.totalInvoice),
      totalProducts: parseEntryDecimalInput(values.totalProducts),
      freightValue: parseEntryDecimalInput(values.freightValue),
      freightRate: parseEntryDecimalInput(values.freightRate),
    };

    if (values.model !== "NACIONAL" && values.model !== "IMPORTADO") {
      const message = "Selecione o modelo NACIONAL ou IMPORTADO.";
      setFieldErrors((current) => ({
        ...current,
        model: [message],
      }));
      toast.error(message);
      return;
    }

    const invalidNumericField = NUMERIC_FIELDS.find(
      (field) =>
        !Number.isFinite(parsedNumbers[field]) || parsedNumbers[field] < 0,
    );

    if (invalidNumericField) {
      const message = "Informe valores numéricos válidos e não negativos.";
      setFieldErrors((current) => ({
        ...current,
        [invalidNumericField]: [message],
      }));
      toast.error(message);
      return;
    }

    const hasChanges =
      values.invoiceNumber.trim() !== entry.invoiceNumber.trim() ||
      values.model.trim() !== entry.model.trim() ||
      parsedNumbers.totalInvoice !== Number(entry.totalInvoice) ||
      parsedNumbers.totalProducts !== Number(entry.totalProducts) ||
      parsedNumbers.freightValue !== Number(entry.freightValue) ||
      parsedNumbers.freightRate !== Number(entry.freightRate) ||
      values.description.trim() !== entry.description.trim();

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryMainAction({
        entryId: entry.id,
        invoiceNumber: values.invoiceNumber,
        model: values.model,
        totalInvoice: parsedNumbers.totalInvoice,
        totalProducts: parsedNumbers.totalProducts,
        freightValue: parsedNumbers.freightValue,
        freightRate: parsedNumbers.freightRate,
        description: values.description,
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
      icon={<ReceiptText className="size-4" />}
      title="Informações da Nota"
      action={
        !isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            onClick={handleEdit}
          >
            <Edit2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
            <span className="sr-only sm:hidden">
              Editar informações da nota
            </span>
          </Button>
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entry-general-invoice-number">
                  Número da nota
                </Label>
                <Input
                  id="entry-general-invoice-number"
                  value={values.invoiceNumber}
                  onChange={(event) =>
                    setField("invoiceNumber", event.target.value)
                  }
                  maxLength={100}
                  required
                  aria-invalid={Boolean(fieldErrors.invoiceNumber?.length)}
                />
                {fieldErrors.invoiceNumber?.[0] ? (
                  <p className="text-destructive text-xs">
                    {fieldErrors.invoiceNumber[0]}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-general-model">Modelo</Label>
                <EntryModelCombobox
                  id="entry-general-model"
                  value={values.model}
                  disabled={isSaving}
                  invalid={Boolean(fieldErrors.model?.length)}
                  onValueChange={(value) => setField("model", value)}
                />
                {fieldErrors.model?.[0] ? (
                  <p className="text-destructive text-xs">
                    {fieldErrors.model[0]}
                  </p>
                ) : null}
              </div>
              {(
                [
                  ["totalInvoice", "Total da nota"],
                  ["totalProducts", "Total dos produtos"],
                  ["freightValue", "valor Frete (R$)"],
                  ["freightRate", "Taxa do frete"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`entry-general-${field}`}>{label}</Label>
                  <Input
                    id={`entry-general-${field}`}
                    inputMode="decimal"
                    value={values[field]}
                    onChange={(event) =>
                      handleNumericChange(field, event.target.value)
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
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="entry-general-description">Descrição</Label>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {values.description.length}/300
                  </span>
                </div>
                <Textarea
                  id="entry-general-description"
                  value={values.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  maxLength={300}
                  rows={3}
                  className="resize-y"
                  aria-invalid={Boolean(fieldErrors.description?.length)}
                />
                {fieldErrors.description?.[0] ? (
                  <p className="text-destructive text-xs">
                    {fieldErrors.description[0]}
                  </p>
                ) : null}
              </div>
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
        <dl className="grid grid-cols-2 gap-4">
          <EntryDetailField
            label="Número da nota"
            value={entry.invoiceNumber}
          />
          <EntryDetailField label="Modelo" value={entry.model} />
          <EntryDetailField
            label="Total da nota"
            value={formatEntryMoney(entry.totalInvoice)}
          />
          <EntryDetailField
            label="Total dos produtos"
            value={formatEntryMoney(entry.totalProducts)}
          />
          <EntryDetailField
            label="Valor Frete (R$)"
            value={formatEntryMoney(entry.freightValue)}
          />
          <EntryDetailField
            label="Taxa do frete (%)"
            value={formatEntryNumber(entry.freightRate)}
          />
          <div className="col-span-2 min-w-0">
            <EntryDetailField label="Descrição" value={entry.description} />
          </div>
          <div className="col-span-2 min-w-0">
            <EntryDetailField
              label="Última atualização"
              value={formatEntryDateTime(entry.updatedAt)}
            />
          </div>
        </dl>
      )}
    </EntrySectionCard>
  );
}
