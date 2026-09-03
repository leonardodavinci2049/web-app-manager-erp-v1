import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryHeadDataSection } from "./overview/entry-head-data-section";
import { EntryIdentificationSection } from "./overview/entry-identification-section";
import { EntryInvoiceSection } from "./overview/entry-invoice-section";
import { EntryPartnersSection } from "./overview/entry-partners-section";
import { EntryValuesSection } from "./overview/entry-values-section";
import { EntryDetailTabs } from "./tabs/entry-detail-tabs";

interface EntryDetailLayoutProps {
  entry: UIEntryDetail;
  returnTo: string;
  imageGallery: ReactNode;
}

/**
 * Detalhe somente leitura da entrada (Server Component). Os cards de
 * identificação, fornecedor/transportadora, nota e valores ficam na coluna de
 * visão geral; tributos, status, resumo, itens e anotações ficam nas abas. A
 * galeria somente leitura do fornecedor é injetada pela página via
 * `imageGallery` (nó `<Suspense>`).
 */
export function EntryDetailLayout({
  entry,
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
          <EntryIdentificationSection entry={entry} />
          <EntryPartnersSection entry={entry} />
          <EntryInvoiceSection entry={entry} />
          <EntryValuesSection entry={entry} />
        </div>
      }
      sectionsTitle="Seções da entrada"
      sectionsDescription="Consulte os dados complementares da entrada."
    >
      <EntryDetailTabs entry={entry} mobileImageGallery={imageGallery} />
    </DetailPageLayout>
  );
}
