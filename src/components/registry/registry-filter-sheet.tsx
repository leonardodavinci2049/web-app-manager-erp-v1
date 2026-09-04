"use client";

import { Filter, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface RegistryFilterSheetProps {
  open: boolean;
  pending: boolean;
  activeCount: number;
  /** Only needed for draft-based sheets; when omitted, filters apply immediately. */
  hasChanges?: boolean;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  /** When omitted, the footer keeps only the clear action. */
  onApply?: () => void;
  onClear: () => void;
}

export function RegistryFilterSheet({
  open,
  pending,
  activeCount,
  hasChanges = false,
  children,
  onOpenChange,
  onApply,
  onClear,
}: RegistryFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={activeCount > 0 ? "default" : "outline"}
          className="hidden h-11 shrink-0 gap-1.5 shadow-sm md:inline-flex"
        >
          <Filter className="size-4" aria-hidden="true" />
          <span className="hidden lg:inline">Filtros</span>
          <span className="lg:hidden">Filtros</span>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center px-1.5 text-xs"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[92vw] max-w-[92vw] flex-col gap-0 p-0 sm:w-full sm:max-w-md"
      >
        <SheetHeader className="border-b p-4 pr-12">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="size-4" aria-hidden="true" />
            Filtros
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {children}
        </div>
        <SheetFooter className="bg-background/95 border-t">
          {onApply ? (
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={pending || activeCount === 0}
                onClick={onClear}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Limpar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={pending || !hasChanges}
                onClick={onApply}
              >
                Aplicar filtros
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending || activeCount === 0}
              onClick={onClear}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
