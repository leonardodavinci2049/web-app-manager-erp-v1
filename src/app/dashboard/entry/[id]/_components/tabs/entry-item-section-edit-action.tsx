"use client";

import { Edit2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ENTRY_CLOSED_EDIT_MESSAGE } from "../entry-edit-action";

interface EntryItemSectionEditActionProps {
  isStockClosed: boolean;
  label: string;
  onEdit: () => void;
}

export function EntryItemSectionEditAction({
  isStockClosed,
  label,
  onEdit,
}: EntryItemSectionEditActionProps) {
  if (isStockClosed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-2"
        disabled
        title={ENTRY_CLOSED_EDIT_MESSAGE}
      >
        <LockKeyhole className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Nota fechada</span>
        <span className="sr-only">
          Editar {label}: {ENTRY_CLOSED_EDIT_MESSAGE}
        </span>
      </Button>
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
