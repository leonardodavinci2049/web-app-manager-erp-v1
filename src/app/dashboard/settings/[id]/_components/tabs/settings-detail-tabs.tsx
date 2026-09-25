"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { DetailImageTab } from "@/app/dashboard/_components/detail-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsCards } from "../settings-cards";
import type {
  SettingCardData,
  SettingsField,
} from "../settings-field-definitions";
import { SettingsDeletionTab } from "./settings-deletion-tab";
import { SettingsNotesTab } from "./settings-notes-tab";

const SETTINGS_TABS: readonly {
  id: string;
  label: string;
  description?: string;
  fields?: readonly SettingsField[];
}[] = [
  { id: "annotations", label: "Anotações" },
  { id: "images", label: "Imagens" },
  {
    id: "sobre",
    label: "Sobre",
    description: "Texto institucional exibido no aplicativo.",
    fields: ["COMPANY_ABOUT_JSON"],
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Dúvidas comuns e respostas do atendimento.",
    fields: ["COMPANY_FAQ_JSON"],
  },
  {
    id: "secoes",
    label: "Seções",
    description: "Vitrines e seções de produtos da página inicial.",
    fields: ["HOME_SECTION_JSON"],
  },
  {
    id: "categorias",
    label: "Categorias",
    description: "Categorias exibidas na página inicial.",
    fields: ["HOME_CATEGORY_JSON"],
  },
  {
    id: "pagamentos",
    label: "Pagamentos",
    description: "Meios de pagamento aceitos na loja.",
    fields: ["PAYMENT_METHOD_JSON"],
  },
  {
    id: "seo",
    label: "SEO",
    description: "Títulos, descrição e palavras-chave para buscas.",
    fields: ["COMPANY_SEO_JSON"],
  },
  {
    id: "home",
    label: "HOME",
    description: "Apresentação, marcas e destaques da página inicial.",
    fields: ["HOME_INFO_JSON", "HOME_BRAND_JSON", "HOME_HERO_JSON"],
  },
  {
    id: "menu",
    label: "Menu",
    description: "Itens de navegação do menu principal.",
    fields: ["HOME_MENU_JSON"],
  },
  {
    id: "diversos",
    label: "Diversos",
    description: "Parâmetros gerais do aplicativo.",
    fields: ["GENERAL_CONFIG_JSON"],
  },
  { id: "deletion", label: "Excluir" },
];

interface SettingsDetailTabsProps {
  configId: number;
  notes: string | null;
  cards: SettingCardData[];
  mobileImageGallery: ReactNode;
}

export function SettingsDetailTabs({
  configId,
  notes,
  cards,
  mobileImageGallery,
}: SettingsDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("annotations");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (!SETTINGS_TABS.some((tab) => tab.id === activeTab)) return;

    const activePanel = tabsContainerRef.current?.querySelector<HTMLElement>(
      '[role="tabpanel"][data-state="active"]',
    );

    if (activePanel?.hasChildNodes()) {
      activePanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeTab]);

  return (
    <div ref={tabsContainerRef} className="[overflow-anchor:none]">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full gap-3 sm:gap-4"
      >
        <TabsList
          className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 md:grid md:grid-cols-6 md:overflow-visible xl:grid-cols-12"
          aria-label="Seções do detalhe da configuração"
        >
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-9 min-w-max px-3 text-xs sm:text-sm md:min-w-0 md:px-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="annotations" className="space-y-4">
          <SettingsNotesTab configId={configId} initialNotes={notes} />
        </TabsContent>

        <TabsContent value="images" className="space-y-3 sm:space-y-4">
          <DetailImageTab mobileGallery={mobileImageGallery} />
        </TabsContent>

        {SETTINGS_TABS.filter((tab) => tab.fields).map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="min-w-0 space-y-3"
          >
            {tab.description ? (
              <p className="text-xs text-muted-foreground sm:text-sm">
                {tab.description}
              </p>
            ) : null}
            <SettingsCards
              configId={configId}
              cards={cards}
              fields={tab.fields ?? []}
            />
          </TabsContent>
        ))}

        <TabsContent value="deletion">
          <SettingsDeletionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
