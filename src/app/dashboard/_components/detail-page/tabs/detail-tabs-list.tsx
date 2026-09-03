import type { ReactNode } from "react";
import { TabsList } from "@/components/ui/tabs";

export type DetailTabColumns = 4 | 5 | 6 | 7 | 8;

// Static Tailwind classes per column count; never built dynamically.
const GRID_COLUMNS_CLASS: Record<DetailTabColumns, string> = {
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
};

interface DetailTabsListProps {
  columns: DetailTabColumns;
  ariaLabel: string;
  children: ReactNode;
}

export function DetailTabsList({
  columns,
  ariaLabel,
  children,
}: DetailTabsListProps) {
  return (
    <TabsList
      className={`h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:overflow-visible ${GRID_COLUMNS_CLASS[columns]}`}
      aria-label={ariaLabel}
    >
      {children}
    </TabsList>
  );
}
