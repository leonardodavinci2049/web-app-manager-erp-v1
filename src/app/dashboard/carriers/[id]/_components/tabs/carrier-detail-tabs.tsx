"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierAddressTab } from "./carrier-address-tab";
import { CarrierDeletionTab } from "./carrier-deletion-tab";
import { CarrierEditingTab } from "./carrier-editing-tab";
import { CarrierImageTab } from "./carrier-image-tab";
import { CarrierInternetTab } from "./carrier-internet-tab";
import { CarrierMiscellaneousTab } from "./carrier-miscellaneous-tab";
import { CarrierNotesTab } from "./carrier-notes-tab";
import { CarrierStatusTab } from "./carrier-status-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface CarrierDetailTabsProps {
  carrier: UICarrier;
  returnTo: string;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function CarrierDetailTabs({
  carrier,
  returnTo,
  imageContent,
  mobileImageGallery,
}: CarrierDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
        aria-label="Seções do detalhe da transportadora"
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
        <TabsTrigger value="internet" className={TAB_TRIGGER_CLASS_NAME}>
          Internet
        </TabsTrigger>
        <TabsTrigger value="miscellaneous" className={TAB_TRIGGER_CLASS_NAME}>
          Diversos
        </TabsTrigger>
        <TabsTrigger value="editing" className={TAB_TRIGGER_CLASS_NAME}>
          Edição
        </TabsTrigger>
        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <CarrierNotesTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="address">
        <CarrierAddressTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="status">
        <CarrierStatusTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="image">
        <CarrierImageTab
          imageContent={imageContent}
          mobileImageGallery={mobileImageGallery}
        />
      </TabsContent>
      <TabsContent value="internet">
        <CarrierInternetTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="miscellaneous">
        <CarrierMiscellaneousTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="editing">
        <CarrierEditingTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="deletion">
        <CarrierDeletionTab carrier={carrier} returnTo={returnTo} />
      </TabsContent>
    </Tabs>
  );
}
