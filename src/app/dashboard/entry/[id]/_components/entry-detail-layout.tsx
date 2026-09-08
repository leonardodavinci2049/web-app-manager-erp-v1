import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryExchangeSection } from "./overview/entry-exchange-section";
import { EntryGeneralSection } from "./overview/entry-general-section";
import { EntryHeadDataSection } from "./overview/entry-head-data-section";
import { EntryPartnersSection } from "./overview/entry-partners-section";
import { EntryDetailTabs } from "./tabs/entry-detail-tabs";

interface EntryDetailLayoutProps {
  entry: UIEntryDetail;
  entryItemsTab: ReactNode;
  returnTo: string;
  imageGallery: ReactNode;
}

/**
 * Detalhe da entrada (Server Component). O cabeçalho reúne fornecedor,
 * transportadora, usuário, data da entrada e status; os cards Geral, Câmbio
 * dólar e Fornecedor e transportadora ficam na coluna de visão geral, com
 * ações desabilitadas (recurso não implementado). Tributos, status, resumo,
 * itens e anotações ficam nas abas. A galeria somente leitura do fornecedor é
 * injetada pela página via `imageGallery` (nó `<Suspense>`).
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
