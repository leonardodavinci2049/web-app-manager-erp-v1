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
import type { PurchasingSupplierOption } from "./types/purchasing-dashboard-types";

interface PurchasingFilterComboboxProps {
  id: string;
  label: string;
  value: number;
  options: PurchasingSupplierOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled: boolean;
  onValueChange: (id: number) => void;
  onSearch: (term: string) => Promise<PurchasingSupplierOption[]>;
}

const SEARCH_DEBOUNCE_MS = 400;

/**
 * Searchable supplier combobox that displays only the current remote results
 * while preserving previously loaded options for the selected label.
 */
export function PurchasingFilterCombobox({
  id,
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  onValueChange,
  onSearch,
}: PurchasingFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadedOptions, setLoadedOptions] = useState<
    PurchasingSupplierOption[]
  >([]);
  const [searchResults, setSearchResults] = useState<
    PurchasingSupplierOption[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const knownOptions = useMemo(() => {
    const byId = new Map<number, PurchasingSupplierOption>();
    for (const option of options) byId.set(option.id, option);
    for (const option of loadedOptions) byId.set(option.id, option);
    return [...byId.values()];
  }, [options, loadedOptions]);

  const visibleOptions = search.trim() === "" ? options : searchResults;
  const selectedOption = knownOptions.find((option) => option.id === value);

  const closeCombobox = () => {
    setOpen(false);
    setSearch("");
    setSearchResults([]);
    setIsSearching(false);
  };

  useEffect(() => {
    if (!open) return;

    const term = search.trim();
    if (term === "") return;

    let isCurrentSearch = true;
    const timer = window.setTimeout(async () => {
      try {
        const results = await onSearch(term);
        if (!isCurrentSearch) return;

        setSearchResults(results);
        setLoadedOptions((current) => {
          const byId = new Map<number, PurchasingSupplierOption>();
          for (const option of current) byId.set(option.id, option);
          for (const option of results) byId.set(option.id, option);
          return [...byId.values()];
        });
      } catch {
        if (isCurrentSearch) setSearchResults([]);
      } finally {
        if (isCurrentSearch) setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timer);
    };
  }, [open, search, onSearch]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setOpen(true);
          else closeCombobox();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-label={label}
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full justify-between font-normal"
          >
            <span className="truncate">
              {value === 0
                ? placeholder
                : (selectedOption?.label ?? `ID ${value}`)}
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
              onChange={(event) => {
                const nextSearch = event.target.value;
                setSearch(nextSearch);
                setSearchResults([]);
                setIsSearching(nextSearch.trim() !== "");
              }}
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
                closeCombobox();
              }}
            >
              <Check
                className={value === 0 ? "size-4" : "size-4 opacity-0"}
                aria-hidden="true"
              />
              <span className="truncate">{placeholder}</span>
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
                    closeCombobox();
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
