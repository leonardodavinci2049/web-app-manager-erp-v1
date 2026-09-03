"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import { CustomerPurchases } from "../purchases/customer-purchases";
import { CustomerAddressTab } from "./customer-address-tab";
import { CustomerDeletionTab } from "./customer-deletion-tab";
import { CustomerInternetTab } from "./customer-internet-tab";
import { CustomerNotesTab } from "./customer-notes-tab";
import { CustomerRegistrationTab } from "./customer-registration-tab";
import { CustomerStatusTab } from "./customer-status-tab";

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
      <DetailTabsList columns={8} ariaLabel="Seções do detalhe do cliente">
        <DetailTabTrigger value="notes">Anotações</DetailTabTrigger>
        <DetailTabTrigger value="address">Endereço</DetailTabTrigger>
        <DetailTabTrigger value="status">Status</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
        <DetailTabTrigger value="products">Compras</DetailTabTrigger>
        <DetailTabTrigger value="internet">Internet</DetailTabTrigger>
        <DetailTabTrigger value="miscellaneous">Diversos</DetailTabTrigger>
        <DetailTabTrigger value="deletion">Exclusão</DetailTabTrigger>
      </DetailTabsList>

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
        <DetailImageTab mobileGallery={mobileImageGallery}>
          {imageContent}
        </DetailImageTab>
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
