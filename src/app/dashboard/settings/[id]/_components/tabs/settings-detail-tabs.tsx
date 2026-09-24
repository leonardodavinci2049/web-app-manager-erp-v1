"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SettingsDeletionTab } from "./settings-deletion-tab";
import { SettingsNotesTab } from "./settings-notes-tab";

interface SettingsDetailTabsProps {
  configId: number;
  notes: string | null;
  mobileImageGallery: ReactNode;
}

export function SettingsDetailTabs({
  configId,
  notes,
  mobileImageGallery,
}: SettingsDetailTabsProps) {
  return (
    <Tabs defaultValue="annotations" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={3} ariaLabel="Seções do detalhe da configuração">
        <DetailTabTrigger value="annotations">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="images">Imagens</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Excluir</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="annotations" className="space-y-4">
        <SettingsNotesTab configId={configId} initialNotes={notes} />
      </TabsContent>

      <TabsContent value="images" className="space-y-3 sm:space-y-4">
        <DetailImageTab mobileGallery={mobileImageGallery} />
      </TabsContent>

      <TabsContent value="deletion">
        <SettingsDeletionTab />
      </TabsContent>
    </Tabs>
  );
}
