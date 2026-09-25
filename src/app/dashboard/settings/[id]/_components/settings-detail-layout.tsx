import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import { SettingsGeneralDataCard } from "./overview/settings-general-data-card";
import { SettingsHeadDataSection } from "./overview/settings-head-data-section";
import { SettingsCards } from "./settings-cards";
import type { SettingsDetailData } from "./settings-detail-types";
import type { SettingCardData } from "./settings-field-definitions";
import { SettingsDetailTabs } from "./tabs/settings-detail-tabs";

interface SettingsDetailLayoutProps {
  config: SettingsDetailData;
  cards: SettingCardData[];
  returnTo: string;
  imageGallery: ReactNode;
  mobileImageGallery: ReactNode;
}

export function SettingsDetailLayout({
  config,
  cards,
  returnTo,
  imageGallery,
  mobileImageGallery,
}: SettingsDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar para configurações"
      imageGallery={imageGallery}
      heading={<SettingsHeadDataSection config={config} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <SettingsGeneralDataCard key={config.id} config={config} />
          <SettingsCards
            configId={config.id}
            cards={cards}
            fields={[
              "COMPANY_INFO_JSON",
              "COMPANY_ADDRESS_JSON",
              "COMPANY_LINKS_JSON",
            ]}
          />
        </div>
      }
      sectionsTitle="Seções da configuração"
      sectionsDescription="Gerencie anotações, imagens, dados da loja e configurações do aplicativo."
    >
      <SettingsDetailTabs
        configId={config.id}
        notes={config.notes}
        cards={cards}
        mobileImageGallery={mobileImageGallery}
      />
    </DetailPageLayout>
  );
}
