"use client";

import { Filter, FolderTree, Home, PackagePlus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
            className="bg-primary absolute inset-x-3 top-0 h-0.5 rounded-b-full"
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

interface CatalogMobileBottomBarProps {
  filterCount: number;
  isFilterOpen: boolean;
  isNewProductOpen: boolean;
  onOpenFilters: () => void;
  onOpenNewProduct: () => void;
}

export function CatalogMobileBottomBar({
  filterCount,
  isFilterOpen,
  isNewProductOpen,
  onOpenFilters,
  onOpenNewProduct,
}: CatalogMobileBottomBarProps) {
  const { openMobile, toggleSidebar } = useSidebar();

  return (
    <nav
      aria-label="Ações do catálogo"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.25)] backdrop-blur md:hidden"
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
          isActive={isFilterOpen}
          onClick={onOpenFilters}
        />
        <BottomBarLink
          href="/dashboard/category"
          icon={<FolderTree className="size-5" aria-hidden="true" />}
          label="Categorias"
        />
        <BottomBarItem
          icon={<PackagePlus className="size-5" aria-hidden="true" />}
          label="Adicionar"
          isActive={isNewProductOpen}
          onClick={onOpenNewProduct}
        />
      </ul>
    </nav>
  );
}
