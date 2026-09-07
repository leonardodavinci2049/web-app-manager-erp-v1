"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OrderFilterOption } from "../types/order-dashboard-types";

interface OrderFilterComboboxProps {
  id: string;
  label: string;
  value: number;
  options: OrderFilterOption[];
  searchPlaceholder: string;
  emptyMessage: string;
  disabled: boolean;
  onValueChange: (id: number) => void;
  onSearch: (term: string) => Promise<OrderFilterOption[]>;
}

const SEARCH_DEBOUNCE_MS = 400;

export function OrderFilterCombobox({
  id,
  label,
  value,
  options,
  searchPlaceholder,
  emptyMessage,
  disabled,
  onValueChange,
  onSearch,
}: OrderFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [extraOptions, setExtraOptions] = useState<OrderFilterOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const mergedOptions = useMemo(() => {
    const byId = new Map<number, OrderFilterOption>();
    for (const option of options) byId.set(option.id, option);
    for (const option of extraOptions) byId.set(option.id, option);
    return [...byId.values()];
  }, [options, extraOptions]);
  const selectedOption = mergedOptions.find((option) => option.id === value);
  const visibleOptions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return mergedOptions;
    return mergedOptions.filter(
      (option) =>
        option.label.toLocaleLowerCase("pt-BR").includes(term) ||
        String(option.id).includes(term),
    );
  }, [mergedOptions, search]);

  useEffect(() => {
    if (!open) return;
    let isCurrent = true;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await onSearch(search.trim());
        if (!isCurrent) return;
        setExtraOptions((current) => {
          const knownIds = new Set(
            [...options, ...current].map((option) => option.id),
          );
          return [...current, ...results.filter(({ id }) => !knownIds.has(id))];
        });
      } catch {
        // The action logs the internal failure and safely returns no options.
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [open, options, onSearch, search]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full justify-between font-normal"
          >
            <span className="truncate">
              {value === 0 ? "Todos" : (selectedOption?.label ?? `ID ${value}`)}
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
          <div className="relative border-b p-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="border-0 pl-8 shadow-none focus-visible:ring-0"
            />
          </div>
          <div
            className="max-h-56 overflow-y-auto p-1"
            role="listbox"
            aria-label={label}
          >
            <Button
              type="button"
              variant="ghost"
              role="option"
              aria-selected={value === 0}
              className="w-full justify-start"
              onClick={() => {
                onValueChange(0);
                setOpen(false);
              }}
            >
              <Check
                className={value === 0 ? "size-4" : "size-4 opacity-0"}
                aria-hidden="true"
              />
              Todos
            </Button>
            {visibleOptions.length === 0 && !isSearching ? (
              <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                {emptyMessage}
              </p>
            ) : (
              visibleOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  role="option"
                  aria-selected={option.id === value}
                  className="w-full justify-start"
                  onClick={() => {
                    onValueChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={
                      option.id === value ? "size-4" : "size-4 opacity-0"
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                </Button>
              ))
            )}
            {isSearching && (
              <p
                className="text-muted-foreground px-2 py-2 text-center text-xs"
                aria-live="polite"
              >
                Pesquisando...
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
