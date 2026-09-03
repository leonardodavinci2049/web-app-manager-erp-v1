"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierAddressTab } from "./supplier-address-tab";
import { SupplierDeletionTab } from "./supplier-deletion-tab";
import { SupplierEditingTab } from "./supplier-editing-tab";
import { SupplierInternetTab } from "./supplier-internet-tab";
import { SupplierMiscellaneousTab } from "./supplier-miscellaneous-tab";
import { SupplierNotesTab } from "./supplier-notes-tab";
import { SupplierStatusTab } from "./supplier-status-tab";

interface SupplierDetailTabsProps {
  supplier: UISupplier;
  returnTo: string;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function SupplierDetailTabs({
  supplier,
  returnTo,
  imageContent,
  mobileImageGallery,
}: SupplierDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={8} ariaLabel="Seções do detalhe do fornecedor">
        <DetailTabTrigger value="notes">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="address">Endereço</DetailTabTrigger>
        <DetailTabTrigger value="status">Status</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="internet">Internet</DetailTabTrigger>
        <DetailTabTrigger value="miscellaneous">Diversos</DetailTabTrigger>
        <DetailTabTrigger value="editing">Edição</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="notes">
        <SupplierNotesTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="address">
        <SupplierAddressTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="status">
        <SupplierStatusTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="image">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageContent}
        </DetailImageTab>
      </TabsContent>
      <TabsContent value="internet">
        <SupplierInternetTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="miscellaneous">
        <SupplierMiscellaneousTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="editing">
        <SupplierEditingTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="deletion">
        <SupplierDeletionTab supplier={supplier} returnTo={returnTo} />
      </TabsContent>
    </Tabs>
  );
}
