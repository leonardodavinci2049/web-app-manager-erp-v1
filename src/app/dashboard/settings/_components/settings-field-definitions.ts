export const SETTINGS_FIELDS = [
  "GENERAL_CONFIG_JSON",
  "COMPANY_INFO_JSON",
  "COMPANY_ABOUT_JSON",
  "COMPANY_ADDRESS_JSON",
  "COMPANY_SEO_JSON",
  "COMPANY_FAQ_JSON",
  "COMPANY_LINKS_JSON",
  "PAYMENT_METHOD_JSON",
  "HOME_INFO_JSON",
  "HOME_BRAND_JSON",
  "HOME_CATEGORY_JSON",
  "HOME_SECTION_JSON",
  "HOME_MENU_JSON",
  "HOME_HERO_JSON",
] as const;

export type SettingsField = (typeof SETTINGS_FIELDS)[number];
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type ScalarDefinition = {
  key: string;
  type: "string" | "number" | "boolean";
};

export type PropertyDefinition =
  | ScalarDefinition
  | {
      key: string;
      type: "list";
      itemType: "object" | "string";
      itemFields?: readonly ScalarDefinition[];
    };

export type SettingDefinition = {
  field: SettingsField;
  title: string;
  properties?: readonly PropertyDefinition[];
};

const text = (key: string): ScalarDefinition => ({ key, type: "string" });
const number = (key: string): ScalarDefinition => ({ key, type: "number" });
const boolean = (key: string): ScalarDefinition => ({ key, type: "boolean" });

// The shapes follow the 14 app-config reference files. API values remain the source of data.
export const SETTINGS_DEFINITIONS: readonly SettingDefinition[] = [
  { field: "GENERAL_CONFIG_JSON", title: "Configuração geral" },
  {
    field: "COMPANY_INFO_JSON",
    title: "Informações da empresa",
    properties: [
      text("name"),
      text("legalName"),
      text("ShortDescription"),
      text("invitation"),
      number("yearFoundation"),
      number("productsQuantity"),
      text("cnpj"),
      text("phone"),
      text("whatsapp"),
      text("email"),
      text("openingHours"),
      text("openingSaturday"),
      text("openingSunday"),
    ],
  },
  { field: "COMPANY_ABOUT_JSON", title: "Sobre a empresa" },
  {
    field: "COMPANY_ADDRESS_JSON",
    title: "Endereço da empresa",
    properties: [
      text("AddressFull"),
      text("addressLocation"),
      text("addressStreet"),
      text("addressCity"),
      text("addressState"),
      text("addressCep"),
      number("addressLatitude"),
      number("addressLongitude"),
      text("mapsEmbedUrl"),
      text("mapsShortUrl"),
    ],
  },
  {
    field: "COMPANY_SEO_JSON",
    title: "SEO da empresa",
    properties: [
      text("titleMain"),
      text("title"),
      text("titleCaption"),
      text("description"),
      text("keywords"),
    ],
  },
  {
    field: "COMPANY_FAQ_JSON",
    title: "Perguntas frequentes",
    properties: [
      {
        key: "questions",
        type: "list",
        itemType: "object",
        itemFields: [
          number("id"),
          text("Question"),
          text("Answer"),
          boolean("isActive"),
        ],
      },
    ],
  },
  {
    field: "COMPANY_LINKS_JSON",
    title: "Links da empresa",
    properties: [
      text("whatsappUrl"),
      text("facebookUrl"),
      text("instagramUrl"),
      text("linktreeUrl"),
      text("googleBusinessUrl"),
    ],
  },
  {
    field: "PAYMENT_METHOD_JSON",
    title: "Formas de pagamento",
    properties: [
      {
        key: "paymentMethods",
        type: "list",
        itemType: "object",
        itemFields: [
          number("id"),
          text("label"),
          text("icon"),
          text("color"),
          boolean("recommended"),
        ],
      },
    ],
  },
  { field: "HOME_INFO_JSON", title: "Informações da página inicial" },
  {
    field: "HOME_BRAND_JSON",
    title: "Marcas em destaque",
    properties: [
      {
        key: "brandsTop",
        type: "list",
        itemType: "object",
        itemFields: [number("id"), text("brandName")],
      },
    ],
  },
  {
    field: "HOME_CATEGORY_JSON",
    title: "Categorias da página inicial",
    properties: [
      {
        key: "categories",
        type: "list",
        itemType: "object",
        itemFields: [
          text("id"),
          text("icon"),
          text("link"),
          text("title"),
          text("description"),
          text("color"),
        ],
      },
    ],
  },
  {
    field: "HOME_SECTION_JSON",
    title: "Seções da página inicial",
    properties: [
      {
        key: "categories",
        type: "list",
        itemType: "object",
        itemFields: [
          number("id"),
          text("title"),
          number("taxonomyId"),
          number("brandId"),
          number("typeId"),
          number("promotionFlag"),
          number("highlightFlag"),
          number("launchFlag"),
        ],
      },
    ],
  },
  {
    field: "HOME_MENU_JSON",
    title: "Menu da página inicial",
    properties: [{ key: "menu", type: "list", itemType: "string" }],
  },
  { field: "HOME_HERO_JSON", title: "Destaque da página inicial" },
];

export type SettingCardData = {
  field: SettingsField;
  value: JsonObject | null;
  raw: string | null;
  invalid: boolean;
};
