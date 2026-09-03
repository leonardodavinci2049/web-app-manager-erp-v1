import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierGeneralSection } from "./overview/supplier-general-section";
import { SupplierHeadDataSection } from "./overview/supplier-head-data-section";
import { SupplierPersonOverview } from "./overview/supplier-person-overview";
import { SupplierDetailTabs } from "./tabs/supplier-detail-tabs";

interface SupplierDetailLayoutProps {
  supplier: UISupplier;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function SupplierDetailLayout({
  supplier,
  returnTo,
  imageGallery,
  imageContent,
}: SupplierDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar aos fornecedores"
      imageGallery={imageGallery}
      heading={<SupplierHeadDataSection supplier={supplier} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <SupplierGeneralSection supplier={supplier} />
          <SupplierPersonOverview supplier={supplier} />
        </div>
      }
      sectionsTitle="Seções do fornecedor"
      sectionsDescription="Consulte os dados complementares e acesse as ações do fornecedor."
    >
      <SupplierDetailTabs
        supplier={supplier}
        returnTo={returnTo}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
