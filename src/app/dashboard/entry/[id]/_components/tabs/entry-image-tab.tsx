import { Images } from "lucide-react";
import type { ReactNode } from "react";
import { DetailImageTab } from "@/app/dashboard/_components/detail-page";
import { EntrySectionCard } from "../entry-section-card";

interface EntryImageTabProps {
  mobileImageGallery: ReactNode;
  supplierName: string;
}

export function EntryImageTab({
  mobileImageGallery,
  supplierName,
}: EntryImageTabProps) {
  return (
    <DetailImageTab mobileGallery={mobileImageGallery}>
      <EntrySectionCard
        icon={<Images className="size-4" />}
        title="Galeria do fornecedor"
      >
        <p className="text-muted-foreground text-sm">
          As imagens desta entrada pertencem ao cadastro do fornecedor{" "}
          {supplierName} e são exibidas em modo somente leitura, sem upload ou
          exclusão.
        </p>
      </EntrySectionCard>
    </DetailImageTab>
  );
}
