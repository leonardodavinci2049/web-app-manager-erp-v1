"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryDeletionTab } from "./entry-deletion-tab";
import { EntryItemsTab } from "./entry-items-tab";
import { EntryNotesTab } from "./entry-notes-tab";
import { EntrySummaryTab } from "./entry-summary-tab";
import { EntryTaxesTab } from "./entry-taxes-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface EntryDetailTabsProps {
  entry: UIEntryDetail;
}

export function EntryDetailTabs({ entry }: EntryDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-5 lg:overflow-visible"
        aria-label="Seções do detalhe da entrada"
      >
        <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS_NAME}>
          Anotações
        </TabsTrigger>
        <TabsTrigger value="taxes" className={TAB_TRIGGER_CLASS_NAME}>
          Tributos
        </TabsTrigger>
        <TabsTrigger value="summary" className={TAB_TRIGGER_CLASS_NAME}>
          Resumo
        </TabsTrigger>
        <TabsTrigger value="items" className={TAB_TRIGGER_CLASS_NAME}>
          Itens da Entrada
        </TabsTrigger>
        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <EntryNotesTab notes={entry.notes} />
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
