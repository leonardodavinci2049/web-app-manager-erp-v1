"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UISupplier } from "@/services/api-main/supplier";
import { SupplierAddressTab } from "./supplier-address-tab";
import { SupplierDeletionTab } from "./supplier-deletion-tab";
import { SupplierEditingTab } from "./supplier-editing-tab";
import { SupplierImageTab } from "./supplier-image-tab";
import { SupplierInternetTab } from "./supplier-internet-tab";
import { SupplierMiscellaneousTab } from "./supplier-miscellaneous-tab";
import { SupplierNotesTab } from "./supplier-notes-tab";
import { SupplierStatusTab } from "./supplier-status-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

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
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
        aria-label="Seções do detalhe do fornecedor"
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
        <SupplierNotesTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="address">
        <SupplierAddressTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="status">
        <SupplierStatusTab supplier={supplier} />
      </TabsContent>
      <TabsContent value="image">
        <SupplierImageTab
          imageContent={imageContent}
          mobileImageGallery={mobileImageGallery}
        />
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
