import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryClosingSection } from "./overview/entry-closing-section";
import { EntryExchangeSection } from "./overview/entry-exchange-section";
import { EntryGeneralSection } from "./overview/entry-general-section";
import { EntryHeadDataSection } from "./overview/entry-head-data-section";
import { EntryPartnersSection } from "./overview/entry-partners-section";
import { EntrySummarySection } from "./overview/entry-summary-section";
import { EntryDetailTabs } from "./tabs/entry-detail-tabs";

interface EntryDetailLayoutProps {
  entry: UIEntryDetail;
  entryItemsTab: ReactNode;
  returnTo: string;
  imageGallery: ReactNode;
}

/**
 * Entry detail Server Component. It composes the editable overview, the
 * read-only invoice summary, closing controls, detail tabs, and supplier image
 * gallery provided by the page through a Suspense boundary.
 */
export function EntryDetailLayout({
  entry,
  entryItemsTab,
  returnTo,
  imageGallery,
}: EntryDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar às entradas"
      imageGallery={imageGallery}
      heading={<EntryHeadDataSection entry={entry} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <EntryGeneralSection entry={entry} />
          <EntryExchangeSection entry={entry} />
          <EntryPartnersSection entry={entry} />
          <EntrySummarySection entry={entry} />
          <EntryClosingSection entry={entry} />
        </div>
      }
      sectionsTitle="Seções da entrada"
      sectionsDescription="Consulte os dados complementares da entrada."
    >
      <EntryDetailTabs
        entry={entry}
        entryItemsTab={entryItemsTab}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
