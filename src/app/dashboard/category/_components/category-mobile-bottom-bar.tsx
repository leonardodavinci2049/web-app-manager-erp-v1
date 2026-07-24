"use client";

import { Filter, FolderPlus, Home, LayoutGrid } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useCategoryQueryNavigation } from "../_hooks/use-category-query-navigation";
import type { CategoryFiltersState } from "./category-types";
import { CategoryCreateDialog } from "./dialogs/category-create-dialog";

const ITEM_CLASS_NAME =
  "relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors outline-none touch-manipulation select-none hover:text-foreground active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

interface BottomBarItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  badgeCount?: number;
  onClick: () => void;
}

function BottomBarItem({
  icon,
  label,
  isActive = false,
  badgeCount,
  onClick,
}: BottomBarItemProps) {
  return (
    <li className="flex flex-1">
      <button
        type="button"
        className={cn(ITEM_CLASS_NAME, isActive && "text-primary")}
        aria-label={label}
        aria-pressed={isActive}
        onClick={onClick}
      >
        <span
          className={cn(
            "relative flex size-6 items-center justify-center transition-transform",
            isActive && "scale-110",
          )}
        >
          {icon}
          {badgeCount && badgeCount > 0 ? (
            <Badge
              className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none"
              aria-hidden="true"
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          ) : null}
        </span>
        <span className="leading-tight">{label}</span>
        {isActive ? (
          <span
            aria-hidden="true"
            className="absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-primary"
          />
        ) : null}
      </button>
    </li>
  );
}

function BottomBarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <li className="flex flex-1">
      <Link href={href} className={ITEM_CLASS_NAME} aria-label={label}>
        <span className="relative flex size-6 items-center justify-center">
          {icon}
        </span>
        <span className="leading-tight">{label}</span>
      </Link>
    </li>
  );
}

interface CategoryMobileBottomBarProps {
  filters: CategoryFiltersState;
  selectedCategoryId?: number;
}

export function CategoryMobileBottomBar({
  filters,
  selectedCategoryId,
}: CategoryMobileBottomBarProps) {
  const { openMobile, toggleSidebar } = useSidebar();
  const navigate = useCategoryQueryNavigation();
  const [isNewFamilyOpen, setIsNewFamilyOpen] = useState(false);
  const filterCount =
    Number(filters.level !== "all") +
    Number(filters.status !== "all") +
    Number(filters.withoutProducts) +
    Number(Boolean(filters.issue));

  const openFilters = () => {
    if (selectedCategoryId) {
      navigate({
        categoryId: undefined,
        tab: undefined,
        productSearch: undefined,
        productPage: undefined,
      });
      return;
    }

    const filtersElement = document.getElementById("category-tree-filters");
    filtersElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    filtersElement
      ?.querySelector<HTMLInputElement>('input[aria-label="Buscar categorias"]')
      ?.focus({ preventScroll: true });
  };

  return (
    <>
      <nav
        aria-label="Ações de categorias"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.25)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex w-full max-w-screen-md items-stretch justify-around gap-1 px-2 py-1">
          <BottomBarItem
            icon={<Home className="size-5" aria-hidden="true" />}
            label="Home"
            isActive={openMobile}
            onClick={toggleSidebar}
          />
          <BottomBarItem
            icon={<Filter className="size-5" aria-hidden="true" />}
            label="Filtros"
            badgeCount={filterCount}
            isActive={!selectedCategoryId}
            onClick={openFilters}
          />
          <BottomBarLink
            href="/dashboard/catalog"
            icon={<LayoutGrid className="size-5" aria-hidden="true" />}
            label="Catálogo"
          />
          <BottomBarItem
            icon={<FolderPlus className="size-5" aria-hidden="true" />}
            label="Nova família"
            isActive={isNewFamilyOpen}
            onClick={() => setIsNewFamilyOpen(true)}
          />
        </ul>
      </nav>

      <CategoryCreateDialog
        open={isNewFamilyOpen}
        onOpenChange={setIsNewFamilyOpen}
      />
    </>
  );
}
