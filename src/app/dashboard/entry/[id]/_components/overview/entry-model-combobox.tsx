"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { ENTRY_CREATE_MODEL_OPTIONS } from "@/app/dashboard/entry/_components/types/entry-dashboard-types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EntryModelComboboxProps {
  id: string;
  value: string;
  disabled?: boolean;
  invalid?: boolean;
  onValueChange: (value: string) => void;
}

export function EntryModelCombobox({
  id,
  value,
  disabled = false,
  invalid = false,
  onValueChange,
}: EntryModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedValue = ENTRY_CREATE_MODEL_OPTIONS.find(
    (option) => option === value,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label="Modelo"
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className="h-9 w-full justify-between font-normal"
        >
          <span
            className={selectedValue ? "truncate" : "text-muted-foreground"}
          >
            {selectedValue ?? "Selecione o modelo"}
          </span>
          <ChevronsUpDown
            className="ml-2 size-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-1"
      >
        <div role="listbox" aria-label="Modelo" className="space-y-1">
          {ENTRY_CREATE_MODEL_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant="ghost"
              role="option"
              aria-selected={option === value}
              className="w-full justify-start"
              onClick={() => {
                onValueChange(option);
                setOpen(false);
              }}
            >
              <Check
                className={option === value ? "size-4" : "size-4 opacity-0"}
                aria-hidden="true"
              />
              {option}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
