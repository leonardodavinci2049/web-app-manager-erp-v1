"use client";

import { Copy } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { updateCustomerNotesAction } from "@/app/dashboard/customer/_actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import { useCustomerSectionAction } from "./customer-section-action";
import { CustomerSectionButton } from "./customer-section-button";

interface CustomerNotesTabProps {
  customer: UICustomerDetail;
}

export function CustomerNotesTab({ customer }: CustomerNotesTabProps) {
  const [notes, setNotes] = useState(customer.notes);
  const { clearError, errors, runAction, saving } = useCustomerSectionAction();

  const copyNotesToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      toast.success("Anotações copiadas para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar as anotações.");
    }
  };

  return (
    <form
      className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        runAction(
          updateCustomerNotesAction({
            customerId: customer.id,
            notes,
          }),
        );
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="customer-detail-notes">Anotações</Label>
        <Textarea
          id="customer-detail-notes"
          value={notes}
          maxLength={2000}
          rows={5}
          disabled={saving}
          aria-invalid={Boolean(errors.notes?.[0])}
          onChange={(event) => {
            setNotes(event.target.value);
            clearError("notes");
          }}
        />
        {errors.notes?.[0] && (
          <p className="text-destructive text-xs">{errors.notes[0]}</p>
        )}
        <p className="text-muted-foreground text-right text-xs">
          {notes.length}/2000
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CustomerSectionButton saving={saving} label="Salvar anotações" />
        <Button
          type="button"
          variant="outline"
          disabled={notes.length === 0}
          onClick={copyNotesToClipboard}
        >
          <Copy className="size-4" />
          Copiar anotações
        </Button>
      </div>
    </form>
  );
}
