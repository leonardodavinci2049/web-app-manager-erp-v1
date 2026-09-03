import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
            Voltar aos fornecedores
          </Link>
        </Button>

        <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          {imageGallery}
        </aside>

        <SupplierHeadDataSection supplier={supplier} />

        <div className="space-y-3 sm:space-y-4">
          <SupplierGeneralSection supplier={supplier} />
          <SupplierPersonOverview supplier={supplier} />
        </div>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h2 className="text-base font-semibold sm:text-lg">
          Seções do fornecedor
        </h2>
        <p className="text-muted-foreground hidden text-sm sm:block">
          Consulte os dados complementares e acesse as ações do fornecedor.
        </p>
      </div>

      <SupplierDetailTabs
        supplier={supplier}
        returnTo={returnTo}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </div>
  );
}
