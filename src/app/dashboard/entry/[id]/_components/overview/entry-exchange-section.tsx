"use client";

import { Check, DollarSign, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { formatEntryNumber } from "../../../_components/lib/format";
import { updateEntryDollarValueAction } from "../../_actions/entry-detail-actions";
import {
  parseEntryDecimalInput,
  sanitizeEntryDecimalInput,
  toEntryDecimalInput,
} from "../entry-decimal-input";
import { EntryDetailField } from "../entry-detail-field";
import {
  ENTRY_CLOSED_EDIT_MESSAGE,
  EntryEditAction,
} from "../entry-edit-action";
import { EntrySectionCard } from "../entry-section-card";

interface EntryExchangeSectionProps {
  entry: Pick<UIEntryDetail, "id" | "exchangeRate" | "isStockClosed">;
}

export function EntryExchangeSection({ entry }: EntryExchangeSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(() =>
    toEntryDecimalInput(entry.exchangeRate),
  );
  const [error, setError] = useState<string>();

  const resetForm = () => {
    setExchangeRate(toEntryDecimalInput(entry.exchangeRate));
    setError(undefined);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (entry.isStockClosed) {
      toast.error(ENTRY_CLOSED_EDIT_MESSAGE);
      setIsEditing(false);
      return;
    }

    const parsedExchangeRate = parseEntryDecimalInput(exchangeRate);

    if (!Number.isFinite(parsedExchangeRate) || parsedExchangeRate <= 0) {
      const message = "Informe um valor de câmbio maior que zero.";
      setError(message);
      toast.error(message);
      return;
    }

    if (parsedExchangeRate === Number(entry.exchangeRate)) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      const result = await updateEntryDollarValueAction({
        entryId: entry.id,
        exchangeRate: parsedExchangeRate,
      });

      if (!result.success) {
        setError(result.fieldErrors?.exchangeRate?.[0]);
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
      icon={<DollarSign className="size-4" />}
      title="Câmbio dólar"
      action={
        !isEditing ? (
          <EntryEditAction
            isStockClosed={entry.isStockClosed}
            label="câmbio do dólar"
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
            <div className="space-y-2">
              <Label htmlFor="entry-exchange-rate">Câmbio atual</Label>
              <Input
                id="entry-exchange-rate"
                inputMode="decimal"
                value={exchangeRate}
                onChange={(event) => {
                  setExchangeRate(
                    sanitizeEntryDecimalInput(event.target.value),
                  );
                  setError(undefined);
                }}
                placeholder="0,00"
                required
                aria-invalid={Boolean(error)}
              />
              {error ? (
                <p className="text-destructive text-xs">{error}</p>
              ) : null}
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
        <dl>
          <EntryDetailField
            label="Câmbio atual"
            value={formatEntryNumber(entry.exchangeRate)}
          />
        </dl>
      )}
    </EntrySectionCard>
  );
}
