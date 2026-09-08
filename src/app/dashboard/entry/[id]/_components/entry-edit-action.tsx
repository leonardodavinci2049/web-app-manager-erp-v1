"use client";

import { Edit2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ENTRY_CLOSED_EDIT_MESSAGE =
  "Esta nota já foi fechada e não pode ser editada.";

interface EntryEditActionProps {
  isStockClosed: boolean;
  label: string;
  onEdit: () => void;
}

export function EntryEditAction({
  isStockClosed,
  label,
  onEdit,
}: EntryEditActionProps) {
  if (isStockClosed) {
    return (
      <span
        className="text-muted-foreground flex items-center gap-1.5 text-xs"
        title={ENTRY_CLOSED_EDIT_MESSAGE}
      >
        <LockKeyhole className="size-3.5" aria-hidden="true" />
        Nota fechada
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-2"
      onClick={onEdit}
    >
      <Edit2 className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Editar</span>
      <span className="sr-only sm:hidden">Editar {label}</span>
    </Button>
  );
}
