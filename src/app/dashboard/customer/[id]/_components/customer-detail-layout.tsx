import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm lg:col-span-2 lg:justify-self-start"
        >
          <Link href={returnTo}>
            <ArrowLeft className="size-4" />
            Voltar aos clientes
          </Link>
        </Button>

        <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          {imageGallery}
        </aside>
        <CustomerHeadDataSection customer={customer} />

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
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h2 className="text-base font-semibold sm:text-lg">
          Seções do cliente
        </h2>
        <p className="text-muted-foreground hidden text-sm sm:block">
          Consulte e atualize os dados complementares do cliente.
        </p>
      </div>

      <CustomerDetailTabs
        customer={customer}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </div>
  );
}
