"use client";

import { Loader2, Search, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegistrySearchProps {
  value: string;
  placeholder: string;
  accessibleLabel: string;
  maxLength?: number;
  pending: boolean;
  onSearch: (value: string) => void;
}

export function RegistrySearch({
  value,
  placeholder,
  accessibleLabel,
  maxLength = 300,
  pending,
  onSearch,
}: RegistrySearchProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const normalizedDraft = draft.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (normalizedDraft !== value) onSearch(normalizedDraft);
  };

  const handleClear = () => {
    setDraft("");
    if (value !== "") onSearch("");
  };

  return (
    <search className="w-full min-w-0 md:max-w-[400px]">
      <form onSubmit={handleSubmit} className="flex w-full min-w-0">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={maxLength}
            placeholder={placeholder}
            className="h-11 rounded-r-none border-r-0 pr-10 pl-9 shadow-sm"
            disabled={pending}
            aria-label={accessibleLabel}
          />
          {draft !== "" && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors"
              disabled={pending}
              aria-label="Limpar pesquisa"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-l-none px-3 shadow-sm sm:px-4"
          disabled={pending || normalizedDraft === value}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only sm:not-sr-only">Pesquisar</span>
        </Button>
      </form>
    </search>
  );
}
