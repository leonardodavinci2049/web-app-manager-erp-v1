"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UIPtype } from "@/services/api-main/ptype";
import { PtypeAnnotationsTab } from "./ptype-annotations-tab";
import { PtypeDeletionTab } from "./ptype-deletion-tab";
import { PtypeMiscellaneousTab } from "./ptype-miscellaneous-tab";

interface PtypeDetailTabsProps {
  item: UIPtype;
  returnTo: string;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function PtypeDetailTabs({
  item,
  returnTo,
  imageContent,
  mobileImageGallery,
}: PtypeDetailTabsProps) {
  return (
    <Tabs defaultValue="annotations" className="w-full gap-3 sm:gap-4">
      <DetailTabsList
        columns={4}
        ariaLabel="Seções do detalhe do tipo de produto"
      >
        <DetailTabTrigger value="annotations">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="miscellaneous">Diversos</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="annotations" className="space-y-4">
        <PtypeAnnotationsTab notes={item.notes} />
      </TabsContent>

      <TabsContent value="image" className="space-y-3 sm:space-y-4">
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageContent}
        </DetailImageTab>
      </TabsContent>

      <TabsContent value="miscellaneous" className="space-y-4">
        <PtypeMiscellaneousTab
          ptypeId={item.id}
          inactive={item.inactive}
          createdAt={item.createdAt}
        />
      </TabsContent>

      <TabsContent value="deletion">
        <PtypeDeletionTab
          ptypeId={item.id}
          ptypeName={item.name}
          returnTo={returnTo}
        />
      </TabsContent>
    </Tabs>
  );
}
