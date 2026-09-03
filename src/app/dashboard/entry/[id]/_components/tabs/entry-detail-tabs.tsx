"use client";

import type { ReactNode } from "react";
import {
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryDeletionTab } from "./entry-deletion-tab";
import { EntryImageTab } from "./entry-image-tab";
import { EntryItemsTab } from "./entry-items-tab";
import { EntryNotesTab } from "./entry-notes-tab";
import { EntrySummaryTab } from "./entry-summary-tab";
import { EntryTaxesTab } from "./entry-taxes-tab";

interface EntryDetailTabsProps {
  entry: UIEntryDetail;
  mobileImageGallery: ReactNode;
}

export function EntryDetailTabs({
  entry,
  mobileImageGallery,
}: EntryDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={6} ariaLabel="Seções do detalhe da entrada">
        <DetailTabTrigger value="notes">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="taxes">Tributos</DetailTabTrigger>
        <DetailTabTrigger value="summary">Resumo</DetailTabTrigger>
        <DetailTabTrigger value="items">Itens da Entrada</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="notes">
        <EntryNotesTab notes={entry.notes} />
      </TabsContent>
      <TabsContent value="image">
        <EntryImageTab
          mobileImageGallery={mobileImageGallery}
          supplierName={entry.supplier}
        />
      </TabsContent>
      <TabsContent value="taxes">
        <EntryTaxesTab entry={entry} />
      </TabsContent>
      <TabsContent value="summary">
        <EntrySummaryTab entry={entry} />
      </TabsContent>
      <TabsContent value="items">
        <EntryItemsTab />
      </TabsContent>
      <TabsContent value="deletion">
        <EntryDeletionTab />
      </TabsContent>
    </Tabs>
  );
}
