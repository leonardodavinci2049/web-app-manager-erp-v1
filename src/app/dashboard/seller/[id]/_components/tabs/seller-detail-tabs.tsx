"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UISellerDetail } from "@/services/api-main/seller";
import { SellerSales } from "../sales/seller-sales";
import { SellerAddressTab } from "./seller-address-tab";
import { SellerDeletionTab } from "./seller-deletion-tab";
import { SellerInternetTab } from "./seller-internet-tab";
import { SellerNotesTab } from "./seller-notes-tab";
import { SellerRegistrationTab } from "./seller-registration-tab";
import { SellerStatusTab } from "./seller-status-tab";

interface SellerDetailTabsProps {
  seller: UISellerDetail;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function SellerDetailTabs({
  seller,
  imageContent,
  mobileImageGallery,
}: SellerDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={8} ariaLabel="Seções do detalhe do vendedor">
        <DetailTabTrigger value="notes">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="address">Endereço</DetailTabTrigger>
        <DetailTabTrigger value="status">Status</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="sales">Vendas</DetailTabTrigger>
        <DetailTabTrigger value="internet">Internet</DetailTabTrigger>
        <DetailTabTrigger value="miscellaneous">Diversos</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="notes">
        <SellerNotesTab seller={seller} />
      </TabsContent>
      <TabsContent value="address">
        <SellerAddressTab seller={seller} />
      </TabsContent>
      <TabsContent value="status">
        <SellerStatusTab seller={seller} />
      </TabsContent>
      <TabsContent value="image">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageContent}
        </DetailImageTab>
      </TabsContent>
      <TabsContent value="sales">
        <SellerSales sellerId={seller.id} />
      </TabsContent>
      <TabsContent value="internet">
        <SellerInternetTab seller={seller} />
      </TabsContent>
      <TabsContent value="miscellaneous">
        <SellerRegistrationTab seller={seller} />
      </TabsContent>
      <TabsContent value="deletion">
        <SellerDeletionTab />
      </TabsContent>
    </Tabs>
  );
}
