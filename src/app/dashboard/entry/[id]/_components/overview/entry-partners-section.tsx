"use client";

import { Check, ExternalLink, Loader2, Truck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  searchEntryFilterCarriers,
  searchEntryFilterSuppliers,
} from "@/app/dashboard/entry/_actions/entry-filter-actions";
import { Button } from "@/components/ui/button";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { updateEntryPartnersAction } from "../../_actions/entry-detail-actions";
import { EntryDetailField } from "../entry-detail-field";
import {
  ENTRY_CLOSED_EDIT_MESSAGE,
  EntryEditAction,
} from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";
import { EntryPartnerCombobox } from "./entry-partner-combobox";

interface EntryPartnersSectionProps {
  entry: Pick<
    UIEntryDetail,
    "id" | "supplierId" | "supplier" | "carrierId" | "carrier" | "isStockClosed"
  >;
}

export function EntryPartnersSection({ entry }: EntryPartnersSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supplierId, setSupplierId] = useState(entry.supplierId);
  const [carrierId, setCarrierId] = useState(entry.carrierId);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const supplierOptions = useMemo(
    () => [{ id: entry.supplierId, label: entry.supplier }],
    [entry.supplierId, entry.supplier],
  );
  const carrierOptions = useMemo(
    () => [{ id: entry.carrierId, label: entry.carrier }],
    [entry.carrierId, entry.carrier],
  );

  const resetForm = () => {
    setSupplierId(entry.supplierId);
    setCarrierId(entry.carrierId);
    setFieldErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (entry.isStockClosed) {
      toast.error(ENTRY_CLOSED_EDIT_MESSAGE);
      setIsEditing(false);
      return;
    }

    if (supplierId <= 0 || carrierId <= 0) {
      const message = "Selecione fornecedor e transportadora.";
      toast.error(message);
      return;
    }

    if (supplierId === entry.supplierId && carrierId === entry.carrierId) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateEntryPartnersAction({
        entryId: entry.id,
        supplierId,
        carrierId,
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
      icon={<Truck className="size-4" />}
      title="Fornecedor e transportadora"
      action={
        !isEditing ? (
          <EntryEditAction
            isStockClosed={entry.isStockClosed}
            label="fornecedor e transportadora"
            onEdit={() => {
              resetForm();
              setIsEditing(true);
            }}
          />
        ) : null
      }
    >
      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <EntryPartnerCombobox
                  id="entry-partners-supplier"
                  label="Fornecedor"
                  value={supplierId}
                  options={supplierOptions}
                  searchPlaceholder="Pesquisar fornecedor..."
                  emptyMessage="Nenhum fornecedor encontrado."
                  disabled={isSaving}
                  invalid={Boolean(fieldErrors.supplierId?.length)}
                  onValueChange={(option) => {
                    setSupplierId(option.id);
                    setFieldErrors((current) => ({
                      ...current,
                      supplierId: [],
                    }));
                  }}
                  onSearch={searchEntryFilterSuppliers}
                />
                {fieldErrors.supplierId?.[0] ? (
                  <p className="text-destructive mt-2 text-xs">
                    {fieldErrors.supplierId[0]}
                  </p>
                ) : null}
              </div>
              <div>
                <EntryPartnerCombobox
                  id="entry-partners-carrier"
                  label="Transportadora"
                  value={carrierId}
                  options={carrierOptions}
                  searchPlaceholder="Pesquisar transportadora..."
                  emptyMessage="Nenhuma transportadora encontrada."
                  disabled={isSaving}
                  invalid={Boolean(fieldErrors.carrierId?.length)}
                  onValueChange={(option) => {
                    setCarrierId(option.id);
                    setFieldErrors((current) => ({
                      ...current,
                      carrierId: [],
                    }));
                  }}
                  onSearch={searchEntryFilterCarriers}
                />
                {fieldErrors.carrierId?.[0] ? (
                  <p className="text-destructive mt-2 text-xs">
                    {fieldErrors.carrierId[0]}
                  </p>
                ) : null}
              </div>
            </div>
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
          <div className="min-w-0">
            <dt className="text-muted-foreground text-xs">Fornecedor</dt>
            <dd className="mt-1 text-sm font-medium">
              <Link
                href={`/dashboard/suppliers/${entry.supplierId}`}
                className="hover:text-primary focus-visible:outline-none focus-visible:underline"
              >
                {entry.supplier}
                <ExternalLink className="ml-1 inline size-3.5" />
                <span className="sr-only">Ver fornecedor</span>
              </Link>
            </dd>
          </div>
          <EntryDetailField label="Transportadora" value={entry.carrier} />
        </dl>
      )}
    </EntrySectionCard>
  );
}
