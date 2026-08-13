"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import { CustomerPurchases } from "../purchases/customer-purchases";
import { CustomerAddressTab } from "./customer-address-tab";
import { CustomerDeletionTab } from "./customer-deletion-tab";
import { CustomerImageTab } from "./customer-image-tab";
import { CustomerInternetTab } from "./customer-internet-tab";
import { CustomerNotesTab } from "./customer-notes-tab";
import { CustomerRegistrationTab } from "./customer-registration-tab";
import { CustomerStatusTab } from "./customer-status-tab";

const TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface CustomerDetailTabsProps {
  customer: UICustomerDetail;
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function CustomerDetailTabs({
  customer,
  imageContent,
  mobileImageGallery,
}: CustomerDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full gap-3 sm:gap-4">
      <TabsList
        className="h-auto w-full snap-x justify-start gap-1 overflow-x-auto p-1 lg:grid lg:grid-cols-8 lg:overflow-visible"
        aria-label="Seções do detalhe do cliente"
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
        <TabsTrigger value="products" className={TAB_TRIGGER_CLASS_NAME}>
          Compras
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
        <CustomerNotesTab customer={customer} />
      </TabsContent>
      <TabsContent value="address">
        <CustomerAddressTab customer={customer} />
      </TabsContent>
      <TabsContent value="status">
        <CustomerStatusTab customer={customer} />
      </TabsContent>
      <TabsContent value="image">
        <CustomerImageTab
          imageContent={imageContent}
          mobileImageGallery={mobileImageGallery}
        />
      </TabsContent>
      <TabsContent value="products">
        <CustomerPurchases customerId={customer.id} />
      </TabsContent>
      <TabsContent value="internet">
        <CustomerInternetTab customer={customer} />
      </TabsContent>
      <TabsContent value="miscellaneous">
        <CustomerRegistrationTab customer={customer} />
      </TabsContent>
      <TabsContent value="deletion">
        <CustomerDeletionTab />
      </TabsContent>
    </Tabs>
  );
}
