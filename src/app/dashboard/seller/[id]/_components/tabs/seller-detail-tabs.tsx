"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UISellerDetail } from "@/services/api-main/seller";
import { SellerSales } from "../sales/seller-sales";
import { SellerAddressTab } from "./seller-address-tab";
import { SellerDeletionTab } from "./seller-deletion-tab";
import { SellerImageTab } from "./seller-image-tab";
import { SellerInternetTab } from "./seller-internet-tab";
import { SellerNotesTab } from "./seller-notes-tab";
import { SellerRegistrationTab } from "./seller-registration-tab";
import { SellerStatusTab } from "./seller-status-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

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
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
        aria-label="Seções do detalhe do vendedor"
      >
        <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS_NAME}>
          Anotações
        </TabsTrigger>
        <TabsTrigger value="address" className={TAB_TRIGGER_CLASS_NAME}>
          Endereço
        </TabsTrigger>
        <TabsTrigger value="status" className={TAB_TRIGGER_CLASS_NAME}>
          Status
        </TabsTrigger>
        <TabsTrigger value="image" className={TAB_TRIGGER_CLASS_NAME}>
          Imagem
        </TabsTrigger>
        <TabsTrigger value="sales" className={TAB_TRIGGER_CLASS_NAME}>
          Vendas
        </TabsTrigger>
        <TabsTrigger value="internet" className={TAB_TRIGGER_CLASS_NAME}>
          Internet
        </TabsTrigger>
        <TabsTrigger value="miscellaneous" className={TAB_TRIGGER_CLASS_NAME}>
          Diversos
        </TabsTrigger>
        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

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
        <SellerImageTab
          imageContent={imageContent}
          mobileImageGallery={mobileImageGallery}
        />
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
