"use client";

import { Check, FileText, Loader2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EntryItemDetailDto } from "../../_actions/entry-item-actions";
import { updateEntryItemTaxCodesAction } from "../../_actions/entry-item-update-actions";
import { EntryDetailField } from "../entry-detail-field";
import { ENTRY_CLOSED_EDIT_MESSAGE } from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";
import { EntryItemSectionEditAction } from "./entry-item-section-edit-action";

const TAX_CODE_FIELDS = [
  ["cst", "CST"],
  ["cfop", "CFOP"],
  ["ncm", "NCM"],
] as const;

type TaxCodeField = (typeof TAX_CODE_FIELDS)[number][0];

interface EntryItemTaxCodesFormValues {
  cst: string;
  cfop: string;
  ncm: string;
}

interface EntryItemTaxCodesSectionProps {
  entryId: number;
  isStockClosed: boolean;
  detail: EntryItemDetailDto;
  onSaved: () => void;
  onEntryClosed: () => void;
}

function toFormValues(detail: EntryItemDetailDto): EntryItemTaxCodesFormValues {
  return {
    cst: detail.cst ?? "",
    cfop: detail.cfop ?? "",
    ncm: detail.ncm ?? "",
  };
}

export function EntryItemTaxCodesSection({
  entryId,
  isStockClosed,
  detail,
  onSaved,
  onEntryClosed,
}: EntryItemTaxCodesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<EntryItemTaxCodesFormValues>(() =>
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

  const setField = (field: TaxCodeField, value: string) => {
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

    const initialValues = toFormValues(detail);
    const hasChanges = TAX_CODE_FIELDS.some(
      ([field]) => values[field] !== initialValues[field],
    );

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryItemTaxCodesAction({
        entryId,
        itemId: detail.itemId,
        cst: values.cst,
        cfop: values.cfop,
        ncm: values.ncm,
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
      icon={<FileText className="text-primary size-4" aria-hidden="true" />}
      title="Códigos fiscais"
      action={
        !isEditing ? (
          <EntryItemSectionEditAction
            isStockClosed={isStockClosed}
            label="códigos fiscais"
            onEdit={handleEdit}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {TAX_CODE_FIELDS.map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`entry-item-tax-codes-${field}`}>
                    {label}
                  </Label>
                  <Input
                    id={`entry-item-tax-codes-${field}`}
                    value={values[field]}
                    onChange={(event) => setField(field, event.target.value)}
                    maxLength={100}
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
          <EntryDetailField label="CFOP" value={detail.cfop} />
          <EntryDetailField label="NCM" value={detail.ncm} />
          <EntryDetailField label="CST" value={detail.cst} />
        </dl>
      )}
    </EntrySectionCard>
  );
}
