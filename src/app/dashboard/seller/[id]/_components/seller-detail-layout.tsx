import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { UISellerDetail } from "@/services/api-main/seller";
import { SellerHeadDataSection } from "./overview/seller-head-data-section";
import { SellerIdentitySection } from "./overview/seller-identity-section";
import { SellerPersonBusinessSections } from "./overview/seller-person-business-sections";
import { SellerPersonTypeSection } from "./overview/seller-person-type-section";
import { SellerDetailTabs } from "./tabs/seller-detail-tabs";

interface SellerDetailLayoutProps {
  seller: UISellerDetail;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function SellerDetailLayout({
  seller,
  returnTo,
  imageGallery,
  imageContent,
}: SellerDetailLayoutProps) {
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
            Voltar aos vendedores
          </Link>
        </Button>

        <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          {imageGallery}
        </aside>
        <SellerHeadDataSection seller={seller} />

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <SellerIdentitySection seller={seller} />

            <SellerPersonTypeSection
              sellerId={seller.id}
              personTypeId={seller.personTypeId}
            />

            <SellerPersonBusinessSections
              seller={seller}
              personTypeId={seller.personTypeId}
            />
          </div>
        </div>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h2 className="text-base font-semibold sm:text-lg">
          Seções do vendedor
        </h2>
        <p className="text-muted-foreground hidden text-sm sm:block">
          Consulte e atualize os dados complementares do vendedor.
        </p>
      </div>

      <SellerDetailTabs
        seller={seller}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </div>
  );
}
