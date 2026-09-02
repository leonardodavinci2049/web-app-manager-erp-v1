"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UIPtype } from "@/services/api-main/ptype";
import { PtypeAnnotationsTab } from "./ptype-annotations-tab";
import { PtypeDeletionTab } from "./ptype-deletion-tab";
import { PtypeImagesTab } from "./ptype-images-tab";
import { PtypeMiscellaneousTab } from "./ptype-miscellaneous-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface PtypeDetailTabsProps {
  item: UIPtype;
  imageGallery: ReactNode;
  imageContent: ReactNode;
  actionsDisabled: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export function PtypeDetailTabs({
  item,
  imageGallery,
  imageContent,
  actionsDisabled,
  onActivate,
  onDeactivate,
  onDelete,
}: PtypeDetailTabsProps) {
  return (
    <Tabs defaultValue="annotations" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-4 lg:overflow-visible"
        aria-label="Seções do detalhe do tipo de produto"
      >
        <TabsTrigger value="annotations" className={TAB_TRIGGER_CLASS_NAME}>
          Anotações
        </TabsTrigger>
        <TabsTrigger value="image" className={TAB_TRIGGER_CLASS_NAME}>
          Imagem
        </TabsTrigger>
        <TabsTrigger value="miscellaneous" className={TAB_TRIGGER_CLASS_NAME}>
          Diversos
        </TabsTrigger>
        <TabsTrigger value="deletion" className={TAB_TRIGGER_CLASS_NAME}>
          Exclusão
        </TabsTrigger>
      </TabsList>

      <TabsContent value="annotations" className="space-y-4">
        <PtypeAnnotationsTab notes={item.notes} />
      </TabsContent>

      <TabsContent value="image" className="space-y-3 sm:space-y-4">
        <PtypeImagesTab
          imageGallery={imageGallery}
          imageContent={imageContent}
        />
      </TabsContent>

      <TabsContent value="miscellaneous" className="space-y-4">
        <PtypeMiscellaneousTab
          inactive={item.inactive}
          createdAt={item.createdAt}
          actionsDisabled={actionsDisabled}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
        />
      </TabsContent>

      <TabsContent value="deletion">
        <PtypeDeletionTab disabled={actionsDisabled} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  );
}
