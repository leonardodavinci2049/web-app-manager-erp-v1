"use client";

import { Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CatalogSearchProps {
  searchTerm: string;
  isLoading: boolean;
  onSearch: (term: string) => void;
}

/**
 * Input de busca isolado. Mantem um buffer local do input e espelha o
 * searchTerm confirmado (URL) para refletir navegacoes externas.
 */
export function CatalogSearch({
  searchTerm,
  isLoading,
  onSearch,
}: CatalogSearchProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleSearch = () => {
    if (inputValue.trim() !== searchTerm) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue("");
    if (searchTerm !== "") {
      onSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="group relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="text-muted-foreground h-4.5 w-4.5 transition-colors group-focus-within:text-primary" />
        </div>
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="focus-visible:border-primary h-11 rounded-r-none border-r-0 pl-10 pr-9 text-sm shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2.5 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button
        onClick={handleSearch}
        disabled={isLoading || inputValue.trim() === searchTerm}
        className="h-11 shrink-0 gap-2 rounded-l-none px-4 shadow-sm sm:px-5"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="hidden text-sm sm:inline">Pesquisar</span>
      </Button>
    </div>
  );
}
