"use client";

import {
  Filter,
  Grid3X3,
  List,
  type LucideIcon,
  Menu,
  Plus,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { RegistryViewMode } from "./use-registry-view-mode";

const ITEM_CLASS =
  "relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors touch-manipulation select-none hover:text-foreground active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring";

interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  badgeCount?: number;
  onClick: () => void;
}

function ActionButton({
  label,
  icon,
  active = false,
  badgeCount,
  onClick,
}: ActionButtonProps) {
  return (
    <li className="flex flex-1">
      <button
        type="button"
        className={cn(ITEM_CLASS, active && "text-primary")}
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
      >
        <span className="relative flex size-6 items-center justify-center">
          {icon}
          {badgeCount && badgeCount > 0 ? (
            <Badge
              className="absolute -top-1.5 -right-2 h-4 min-w-4 rounded-full px-1 text-[10px] leading-4"
              aria-hidden="true"
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          ) : null}
        </span>
        <span>{label}</span>
      </button>
    </li>
  );
}

interface RegistryMobileBottomBarProps {
  label: string;
  filterCount?: number;
  filterOpen?: boolean;
  onOpenFilters?: () => void;
  viewMode: RegistryViewMode;
  onToggleView: () => void;
  addLabel?: string;
  addOpen?: boolean;
  onAdd?: () => void;
  extraAction?: {
    label: string;
    href: string;
    icon: LucideIcon;
  };
}

export function RegistryMobileBottomBar({
  label,
  filterCount = 0,
  filterOpen = false,
  onOpenFilters,
  viewMode,
  onToggleView,
  addLabel,
  addOpen = false,
  onAdd,
  extraAction,
}: RegistryMobileBottomBarProps) {
  const { openMobile, toggleSidebar } = useSidebar();
  const ExtraIcon = extraAction?.icon;

  return (
    <nav
      aria-label={`Ações de ${label}`}
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.25)] backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-screen-md items-stretch gap-1 px-2 py-1">
        <ActionButton
          label="Menu"
          icon={<Menu className="size-5" aria-hidden="true" />}
          active={openMobile}
          onClick={toggleSidebar}
        />
        {onOpenFilters && (
          <ActionButton
            label="Filtros"
            icon={<Filter className="size-5" aria-hidden="true" />}
            active={filterOpen}
            badgeCount={filterCount}
            onClick={onOpenFilters}
          />
        )}
        <ActionButton
          label={viewMode === "grid" ? "Lista" : "Grade"}
          icon={
            viewMode === "grid" ? (
              <List className="size-5" aria-hidden="true" />
            ) : (
              <Grid3X3 className="size-5" aria-hidden="true" />
            )
          }
          active={viewMode === "list"}
          onClick={onToggleView}
        />
        {extraAction && ExtraIcon && (
          <li className="flex flex-1">
            <Link
              href={extraAction.href}
              className={ITEM_CLASS}
              aria-label={extraAction.label}
            >
              <ExtraIcon className="size-5" aria-hidden="true" />
              <span>{extraAction.label}</span>
            </Link>
          </li>
        )}
        {onAdd && addLabel && (
          <ActionButton
            label="Adicionar"
            icon={<Plus className="size-5" aria-hidden="true" />}
            active={addOpen}
            onClick={onAdd}
          />
        )}
      </ul>
    </nav>
  );
}
