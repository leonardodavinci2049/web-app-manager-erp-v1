"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierAddressTab } from "./carrier-address-tab";
import { CarrierDeletionTab } from "./carrier-deletion-tab";
import { CarrierEditingTab } from "./carrier-editing-tab";
import { CarrierInternetTab } from "./carrier-internet-tab";
import { CarrierMiscellaneousTab } from "./carrier-miscellaneous-tab";
import { CarrierNotesTab } from "./carrier-notes-tab";
import { CarrierStatusTab } from "./carrier-status-tab";

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
      <DetailTabsList
        columns={8}
        ariaLabel="Seções do detalhe da transportadora"
      >
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
        <CarrierNotesTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="address">
        <CarrierAddressTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="status">
        <CarrierStatusTab carrier={carrier} />
      </TabsContent>
      <TabsContent value="image">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageContent}
        </DetailImageTab>
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
