"use client";

import type { ReactNode } from "react";
import {
  DetailImageTab,
  DetailTabsList,
  DetailTabTrigger,
} from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface OrderDetailTabsProps {
  items: ReactNode;
  history: ReactNode;
  customer: ReactNode;
  seller: ReactNode;
  imageGallery: ReactNode;
  sellerName: string;
}

export function OrderDetailTabs({
  items,
  history,
  customer,
  seller,
  imageGallery,
  sellerName,
}: OrderDetailTabsProps) {
  return (
    <Tabs defaultValue="items" className="w-full gap-3 sm:gap-4">
      <DetailTabsList columns={5} ariaLabel="Seções do detalhe do pedido">
        <DetailTabTrigger value="items">Itens</DetailTabTrigger>
        <DetailTabTrigger value="history">Histórico</DetailTabTrigger>
        <DetailTabTrigger value="customer">Cliente</DetailTabTrigger>
        <DetailTabTrigger value="seller">Vendedor</DetailTabTrigger>
        <DetailTabTrigger value="image">Imagem</DetailTabTrigger>
      </DetailTabsList>

      <TabsContent value="items">{items}</TabsContent>
      <TabsContent value="history">{history}</TabsContent>
      <TabsContent value="customer">{customer}</TabsContent>
      <TabsContent value="seller">{seller}</TabsContent>
      <TabsContent value="image">
        <DetailImageTab mobileGallery={imageGallery}>
          <p className="text-muted-foreground text-sm lg:hidden">
            Galeria somente leitura do vendedor {sellerName}.
          </p>
          <p className="text-muted-foreground hidden text-sm lg:block">
            A galeria somente leitura do vendedor está disponível ao lado das
            informações do pedido.
          </p>
        </DetailImageTab>
      </TabsContent>
    </Tabs>
  );
}
