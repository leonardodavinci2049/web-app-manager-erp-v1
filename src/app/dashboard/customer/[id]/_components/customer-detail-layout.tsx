import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type {
  UICustomerDetail,
  UISellerInfo,
} from "@/services/api-main/customer-general";
import { CustomerHeadDataSection } from "./overview/customer-head-data-section";
import { CustomerIdentitySection } from "./overview/customer-identity-section";
import { CustomerPersonBusinessSections } from "./overview/customer-person-business-sections";
import { CustomerTypeSections } from "./overview/customer-type-sections";
import { RelatedSellerSection } from "./overview/related-seller-section";
import { CustomerDetailTabs } from "./tabs/customer-detail-tabs";

interface CustomerDetailLayoutProps {
  customer: UICustomerDetail;
  seller?: UISellerInfo;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function CustomerDetailLayout({
  customer,
  seller,
  returnTo,
  imageGallery,
  imageContent,
}: CustomerDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar aos clientes"
      imageGallery={imageGallery}
      heading={<CustomerHeadDataSection customer={customer} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <CustomerIdentitySection customer={customer} />

            <CustomerTypeSections
              customerId={customer.id}
              personTypeId={customer.personTypeId}
              customerTypeId={customer.customerTypeId}
              showCustomerType={false}
            />

            <CustomerPersonBusinessSections
              customer={customer}
              personTypeId={customer.personTypeId}
            />

            <CustomerTypeSections
              customerId={customer.id}
              personTypeId={customer.personTypeId}
              customerTypeId={customer.customerTypeId}
              showPersonType={false}
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <RelatedSellerSection seller={seller} />
          </div>
        </div>
      }
      sectionsTitle="Seções do cliente"
      sectionsDescription="Consulte e atualize os dados complementares do cliente."
    >
      <CustomerDetailTabs
        customer={customer}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
