"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useTransition } from "react";
import {
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import { buildSettingsUrl } from "./settings-list-params";
import type { SettingsSearchState } from "./settings-list-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:settings-view-mode";

interface SettingsListToolbarProps {
  searchState: SettingsSearchState;
  grid: ReactNode;
  list: ReactNode;
}

export function SettingsListToolbar({
  searchState,
  grid,
  list,
}: SettingsListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  const navigate = useCallback(
    (search: string) => {
      startTransition(() => {
        router.replace(buildSettingsUrl({ search }));
      });
    },
    [router],
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={searchState.search}
            placeholder="Buscar por nome ou ID..."
            accessibleLabel="Pesquisar configurações por nome ou ID"
            maxLength={100}
            pending={isPending}
            onSearch={navigate}
          />
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
        </div>
      </div>

      <RegistryResults pending={isPending}>
        {viewMode === "list" ? list : grid}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="configurações"
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
    </div>
  );
}
