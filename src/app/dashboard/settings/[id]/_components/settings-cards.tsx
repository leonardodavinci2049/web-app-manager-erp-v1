"use client";

import {
  Award,
  Building2,
  Check,
  CircleHelp,
  CreditCard,
  FileText,
  Home,
  Layers,
  LayoutGrid,
  Link2,
  type LucideIcon,
  MapPin,
  Menu,
  Pencil,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { updateSettingsFieldAction } from "../_actions/settings-actions";
import {
  type JsonObject,
  type JsonValue,
  type PropertyDefinition,
  type ScalarDefinition,
  SETTINGS_DEFINITIONS,
  type SettingCardData,
  type SettingDefinition,
  type SettingsField,
} from "./settings-field-definitions";

type JsonPath = (string | number)[];
type TextOverride = { path: JsonPath; text: string };
type OverrideMap = Record<string, TextOverride>;

const FIELD_ICONS: Record<SettingsField, LucideIcon> = {
  GENERAL_CONFIG_JSON: Settings2,
  COMPANY_INFO_JSON: Building2,
  COMPANY_ABOUT_JSON: FileText,
  COMPANY_ADDRESS_JSON: MapPin,
  COMPANY_SEO_JSON: Search,
  COMPANY_FAQ_JSON: CircleHelp,
  COMPANY_LINKS_JSON: Link2,
  PAYMENT_METHOD_JSON: CreditCard,
  HOME_INFO_JSON: Home,
  HOME_BRAND_JSON: Award,
  HOME_CATEGORY_JSON: LayoutGrid,
  HOME_SECTION_JSON: Layers,
  HOME_MENU_JSON: Menu,
  HOME_HERO_JSON: Sparkles,
};

const TOP_FIELDS: readonly SettingsField[] = [
  "COMPANY_INFO_JSON",
  "COMPANY_ADDRESS_JSON",
  "COMPANY_LINKS_JSON",
];

const TAB_GROUPS: readonly {
  id: string;
  label: string;
  description: string;
  fields: readonly SettingsField[];
}[] = [
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
];

const SUMMARY_LIMIT = 6;

const PROPERTY_LABELS: Record<string, string> = {
  name: "Nome",
  legalName: "Razão social",
  ShortDescription: "Descrição curta",
  invitation: "Convite",
  yearFoundation: "Ano de fundação",
  productsQuantity: "Quantidade de produtos",
  cnpj: "CNPJ",
  phone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  openingHours: "Horário de funcionamento",
  openingSaturday: "Horário de sábado",
  openingSunday: "Horário de domingo",
  AddressFull: "Endereço completo",
  addressLocation: "Localização",
  addressStreet: "Logradouro",
  addressCity: "Cidade",
  addressState: "Estado",
  addressCep: "CEP",
  addressLatitude: "Latitude",
  addressLongitude: "Longitude",
  mapsEmbedUrl: "URL do mapa incorporado",
  mapsShortUrl: "URL curta do mapa",
  titleMain: "Título principal",
  title: "Título",
  titleCaption: "Legenda do título",
  description: "Descrição",
  keywords: "Palavras-chave",
  questions: "Perguntas",
  id: "ID",
  Question: "Pergunta",
  Answer: "Resposta",
  isActive: "Ativo",
  whatsappUrl: "URL do WhatsApp",
  facebookUrl: "URL do Facebook",
  instagramUrl: "URL do Instagram",
  linktreeUrl: "URL do Linktree",
  googleBusinessUrl: "URL do Google Business",
  paymentMethods: "Formas de pagamento",
  label: "Nome exibido",
  icon: "Ícone",
  color: "Cor",
  recommended: "Recomendado",
  brandsTop: "Marcas em destaque",
  brandName: "Nome da marca",
  categories: "Categorias",
  link: "Link",
  taxonomyId: "ID da taxonomia",
  brandId: "ID da marca",
  typeId: "ID do tipo",
  promotionFlag: "Indicador de promoção",
  highlightFlag: "Indicador de destaque",
  launchFlag: "Indicador de lançamento",
  menu: "Menu",
};

function propertyLabel(key: string): string {
  return PROPERTY_LABELS[key] ?? key;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function editorType(value: JsonValue): ScalarDefinition["type"] | "json" {
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "json";
}

function defaultValue(type: ScalarDefinition["type"]): JsonValue {
  if (type === "number") return 0;
  if (type === "boolean") return false;
  return "";
}

function truncate(text: string, max = 80): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function previewScalar(value: JsonValue): string {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "—";
  if (typeof value === "string") {
    return value.trim() === "" ? "—" : truncate(value, 80);
  }
  if (Array.isArray(value)) {
    return value.length === 0
      ? "Nenhum item"
      : `${value.length} ${value.length === 1 ? "item" : "itens"}`;
  }
  const keys = Object.keys(value);
  return keys.length === 0
    ? "—"
    : `${keys.length} ${keys.length === 1 ? "campo" : "campos"}`;
}

function listPreview(
  value: JsonValue[],
  itemFields?: readonly ScalarDefinition[],
): string {
  if (value.length === 0) return "Nenhum item";
  const samples = value.slice(0, 2).map((item) => {
    if (typeof item === "string") return truncate(item, 32);
    if (isJsonObject(item)) {
      const labelKeys = ["brandName", "title", "label", "name", "Question"];
      for (const key of labelKeys) {
        const entry = item[key];
        if (typeof entry === "string" && entry.trim() !== "") {
          return truncate(entry, 32);
        }
        if (typeof entry === "number") return String(entry);
      }
      const firstField = itemFields?.[0]?.key;
      if (firstField) {
        const entry = item[firstField];
        if (typeof entry === "string" && entry.trim() !== "") {
          return truncate(entry, 32);
        }
        if (typeof entry === "number") return String(entry);
      }
      return "Item";
    }
    return "Item";
  });
  const count = `${value.length} ${value.length === 1 ? "item" : "itens"}`;
  return `${count} • ${samples.join(" • ")}`;
}

type SummaryEntry = { key: string; label: string; preview: string };

function buildSummary(
  value: JsonObject,
  definition: SettingDefinition,
): SummaryEntry[] {
  const entries: SummaryEntry[] = [];
  const orderedKeys = [
    ...(definition.properties?.map((property) => property.key) ?? []),
    ...Object.keys(value).filter(
      (key) => !definition.properties?.some((property) => property.key === key),
    ),
  ];
  const seen = new Set<string>();
  for (const key of orderedKeys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const entry = value[key];
    if (entry === undefined) continue;
    const property = definition.properties?.find((item) => item.key === key);
    if (property?.type === "list" && Array.isArray(entry)) {
      entries.push({
        key,
        label: propertyLabel(key),
        preview: listPreview(entry, property.itemFields),
      });
    } else {
      entries.push({
        key,
        label: propertyLabel(key),
        preview: previewScalar(entry),
      });
    }
  }
  return entries;
}

function structureError(
  value: JsonObject | null,
  definition: SettingDefinition,
): boolean {
  if (!value || !definition.properties) return false;

  for (const property of definition.properties) {
    const entry = value[property.key];
    if (entry === undefined) continue;
    if (property.type !== "list") {
      if (typeof entry !== property.type) return true;
      continue;
    }
    if (!Array.isArray(entry)) return true;
    for (const item of entry) {
      if (property.itemType === "string") {
        if (typeof item !== "string") return true;
      } else {
        if (!isJsonObject(item)) return true;
        for (const itemField of property.itemFields ?? []) {
          const itemValue = item[itemField.key];
          if (itemValue !== undefined && typeof itemValue !== itemField.type) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function prepareDraft(
  value: JsonObject,
  definition: SettingDefinition,
): JsonObject {
  const draft = structuredClone(value);
  for (const property of definition.properties ?? []) {
    if (property.type !== "list") {
      if (draft[property.key] === undefined) {
        draft[property.key] = defaultValue(property.type);
      }
      continue;
    }
    if (draft[property.key] === undefined) draft[property.key] = [];
    const list = draft[property.key];
    if (property.itemType === "object" && Array.isArray(list)) {
      for (const item of list) {
        if (!isJsonObject(item)) continue;
        for (const itemField of property.itemFields ?? []) {
          if (item[itemField.key] === undefined) {
            item[itemField.key] = defaultValue(itemField.type);
          }
        }
      }
    }
  }
  return draft;
}

function setAtPath(
  root: JsonObject,
  path: JsonPath,
  value: JsonValue,
): JsonObject {
  const next = structuredClone(root);
  let target: JsonObject | JsonValue[] = next;
  for (const segment of path.slice(0, -1)) {
    const child: JsonValue = Array.isArray(target)
      ? target[Number(segment)]
      : target[String(segment)];
    if (!isJsonObject(child) && !Array.isArray(child)) return next;
    target = child;
  }
  const key = path[path.length - 1];
  if (Array.isArray(target) && typeof key === "number") target[key] = value;
  else if (!Array.isArray(target)) target[String(key)] = value;
  return next;
}

function addOverride(
  current: OverrideMap,
  path: JsonPath,
  text: string,
): OverrideMap {
  return { ...current, [JSON.stringify(path)]: { path, text } };
}

function parseEditedObject(
  freeMode: boolean,
  freeText: string,
  draft: JsonObject,
  numberTexts: OverrideMap,
  jsonTexts: OverrideMap,
): JsonObject {
  if (freeMode) {
    const parsed: unknown = JSON.parse(freeText);
    if (!isJsonObject(parsed)) throw new Error("root");
    return parsed;
  }

  let result = structuredClone(draft);
  for (const { path, text } of Object.values(numberTexts)) {
    if (text.trim() === "") throw new Error("number");
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) throw new Error("number");
    result = setAtPath(result, path, parsed);
  }
  for (const { path, text } of Object.values(jsonTexts)) {
    const parsed: unknown = JSON.parse(text);
    result = setAtPath(result, path, parsed as JsonValue);
  }
  return result;
}

function SettingsCard({
  data,
  definition,
}: {
  data: SettingCardData;
  definition: SettingDefinition;
}) {
  const router = useRouter();
  const id = useId();
  const [saved, setSaved] = useState(data);
  const lastIncomingRaw = useRef(data.raw);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<JsonObject>(data.value ?? {});
  const [freeText, setFreeText] = useState(data.raw ?? "{}");
  const [numberTexts, setNumberTexts] = useState<OverrideMap>({});
  const [jsonTexts, setJsonTexts] = useState<OverrideMap>({});
  const [feedback, setFeedback] = useState<{
    error: boolean;
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!editing && data.raw !== lastIncomingRaw.current) {
      lastIncomingRaw.current = data.raw;
      setSaved(data);
    }
  }, [data, editing]);

  const malformed = saved.invalid || structureError(saved.value, definition);
  const freeMode = !definition.properties || malformed;
  const displayed = editing ? draft : (saved.value ?? {});
  const Icon = FIELD_ICONS[definition.field] ?? Settings2;

  function beginEdit() {
    setDraft(prepareDraft(saved.value ?? {}, definition));
    setFreeText(saved.raw ?? "{}");
    setNumberTexts({});
    setJsonTexts({});
    setFeedback(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setFeedback(null);
    setNumberTexts({});
    setJsonTexts({});
  }

  function save() {
    let value: JsonObject;
    try {
      value = parseEditedObject(
        freeMode,
        freeText,
        draft,
        numberTexts,
        jsonTexts,
      );
    } catch {
      setFeedback({
        error: true,
        message: "Informe um objeto JSON válido e revise os números.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateSettingsFieldAction({
          field: definition.field,
          value,
        });
        setFeedback({ error: !result.success, message: result.message });
        if (result.success) {
          const updated: SettingCardData = {
            field: definition.field,
            value: result.value,
            raw: JSON.stringify(result.value),
            invalid: false,
          };
          setSaved(updated);
          setDraft(result.value);
          setEditing(false);
          router.refresh();
        }
      } catch {
        setFeedback({
          error: true,
          message: "Não foi possível salvar a configuração. Tente novamente.",
        });
      }
    });
  }

  function renderScalar(
    label: string,
    value: JsonValue,
    path: JsonPath,
    type: ScalarDefinition["type"] | "json",
  ) {
    const pathKey = JSON.stringify(path);
    const inputId = `${id}-${encodeURIComponent(pathKey)}`;
    if (type === "boolean") {
      return (
        <label
          key={pathKey}
          htmlFor={inputId}
          className="flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-sm"
        >
          <input
            id={inputId}
            type="checkbox"
            checked={value === true}
            disabled={!editing || pending}
            onChange={(event) =>
              setDraft((current) =>
                setAtPath(current, path, event.target.checked),
              )
            }
            className="size-4 accent-primary"
          />
          <span className="break-all">{label}</span>
        </label>
      );
    }

    const text =
      type === "number"
        ? (numberTexts[pathKey]?.text ?? String(value))
        : type === "json"
          ? (jsonTexts[pathKey]?.text ?? JSON.stringify(value, null, 2))
          : String(value);
    const isLong =
      type === "json" ||
      /description|invitation|answer|addressfull/i.test(String(path.at(-1)));
    const updateText = (next: string) => {
      if (type === "number") {
        setNumberTexts((current) => addOverride(current, path, next));
      } else if (type === "json") {
        setJsonTexts((current) => addOverride(current, path, next));
      } else {
        setDraft((current) => setAtPath(current, path, next));
      }
    };

    return (
      <div key={pathKey} className="min-w-0 space-y-1.5">
        <label htmlFor={inputId} className="block truncate text-xs font-medium">
          {label}
        </label>
        {isLong ? (
          <Textarea
            id={inputId}
            value={text}
            readOnly={!editing || pending}
            onChange={(event) => updateText(event.target.value)}
            rows={type === "json" ? 4 : 2}
            className="font-mono text-sm"
          />
        ) : (
          <Input
            id={inputId}
            value={text}
            readOnly={!editing || pending}
            inputMode={type === "number" ? "decimal" : undefined}
            onChange={(event) => updateText(event.target.value)}
            className="h-9 text-sm"
          />
        )}
      </div>
    );
  }

  function renderObjectFields(
    value: JsonObject,
    fields: readonly ScalarDefinition[],
    path: JsonPath,
  ) {
    const known = new Set(fields.map((field) => field.key));
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {fields
          .filter((field) => value[field.key] !== undefined)
          .map((field) =>
            renderScalar(
              propertyLabel(field.key),
              value[field.key],
              [...path, field.key],
              field.type,
            ),
          )}
        {Object.entries(value)
          .filter(([key]) => !known.has(key))
          .map(([key, entry]) =>
            renderScalar(
              propertyLabel(key),
              entry,
              [...path, key],
              editorType(entry),
            ),
          )}
      </div>
    );
  }

  function renderProperty(property: PropertyDefinition) {
    const value = displayed[property.key];
    if (property.type !== "list") {
      if (value === undefined) return null;
      return renderScalar(
        propertyLabel(property.key),
        value,
        [property.key],
        property.type,
      );
    }
    if (!Array.isArray(value)) return null;
    return (
      <section key={property.key} className="space-y-2 sm:col-span-2">
        <h3 className="text-xs font-semibold break-all">
          {propertyLabel(property.key)} ({value.length})
        </h3>
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum item cadastrado.
          </p>
        )}
        <div className="space-y-2.5">
          {value.map((item, index) => {
            const rowKey = `${property.key}-${index}`;
            return (
              <div
                key={rowKey}
                className="min-w-0 rounded-lg border bg-muted/30 p-3"
              >
                <p className="mb-2 text-xs font-medium">Item {index + 1}</p>
                {property.itemType === "string" && typeof item === "string"
                  ? renderScalar("Valor", item, [property.key, index], "string")
                  : isJsonObject(item)
                    ? renderObjectFields(item, property.itemFields ?? [], [
                        property.key,
                        index,
                      ])
                    : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  function renderSummary() {
    const value = saved.value;
    if (!value) {
      return (
        <p className="text-sm text-muted-foreground">
          Nenhum conteúdo cadastrado.
        </p>
      );
    }
    if (freeMode) {
      const keys = Object.keys(value);
      const raw = saved.raw ?? "{}";
      return (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {keys.length === 0
              ? "Objeto JSON vazio."
              : `${keys.length} ${keys.length === 1 ? "campo" : "campos"}: ${keys
                  .slice(0, 4)
                  .map((key) => propertyLabel(key))
                  .join(" • ")}${keys.length > 4 ? " • …" : ""}`}
          </p>
          <pre className="max-h-24 overflow-hidden rounded-md bg-muted/60 p-2.5 font-mono text-xs text-muted-foreground">
            {truncate(raw, 280)}
          </pre>
        </div>
      );
    }
    const entries = buildSummary(value, definition);
    if (entries.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Nenhum conteúdo cadastrado.
        </p>
      );
    }
    const visible = entries.slice(0, SUMMARY_LIMIT);
    const hidden = entries.length - visible.length;
    return (
      <div className="space-y-2">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((entry) => (
            <div key={entry.key} className="min-w-0">
              <dt className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {entry.label}
              </dt>
              <dd className="truncate text-sm" title={entry.preview}>
                {entry.preview}
              </dd>
            </div>
          ))}
        </dl>
        {hidden > 0 && (
          <p className="text-xs text-muted-foreground">
            +{hidden} {hidden === 1 ? "campo" : "campos"} — edite para ver
            todos.
          </p>
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "min-w-0 gap-0 overflow-hidden py-0 transition-all",
        editing && "border-primary/60 shadow-md ring-2 ring-primary/15",
      )}
    >
      <CardHeader className="px-4 pt-3.5 pb-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted",
                editing && "bg-primary/10 text-primary",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm sm:text-[15px]">
                  {definition.title}
                </CardTitle>
                {editing ? (
                  <Badge variant="secondary" className="text-[11px]">
                    Editando
                  </Badge>
                ) : malformed ? (
                  <Badge variant="destructive" className="text-[11px]">
                    Revisar
                  </Badge>
                ) : null}
              </div>
              <CardDescription className="mt-0.5 line-clamp-2 text-xs">
                {definition.description}
              </CardDescription>
            </div>
          </div>
          {!editing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={beginEdit}
              className="h-8 w-8 shrink-0 p-0"
              aria-label={`Editar ${definition.title}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                disabled={pending}
                className="h-8 w-8 p-0"
                aria-label="Cancelar edição"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={save}
                disabled={pending}
                className="h-8 w-8 p-0"
                aria-label={
                  pending ? "Salvando alterações" : "Salvar alterações"
                }
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 sm:px-5">
        {editing && (
          <p className="rounded-md bg-primary/5 px-2.5 py-1.5 text-xs text-muted-foreground">
            Editando — altere os campos e confirme com o ícone de salvar no topo
            do card.
          </p>
        )}
        {malformed && (
          <p role="alert" className="text-xs text-destructive sm:text-sm">
            O conteúdo atual não corresponde à estrutura esperada. Revise o JSON
            antes de salvar.
          </p>
        )}
        {!editing ? (
          renderSummary()
        ) : freeMode ? (
          <div className="space-y-1.5">
            <label htmlFor={`${id}-json`} className="block text-xs font-medium">
              Objeto JSON
            </label>
            <Textarea
              id={`${id}-json`}
              value={freeText}
              readOnly={pending}
              onChange={(event) => setFreeText(event.target.value)}
              rows={8}
              spellCheck={false}
              className="font-mono text-sm"
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {definition.properties?.map(renderProperty)}
            {Object.entries(displayed)
              .filter(
                ([key]) =>
                  !definition.properties?.some(
                    (property) => property.key === key,
                  ),
              )
              .map(([key, entry]) =>
                renderScalar(
                  propertyLabel(key),
                  entry,
                  [key],
                  editorType(entry),
                ),
              )}
          </div>
        )}
        {feedback && (
          <p
            role={feedback.error ? "alert" : "status"}
            className={
              feedback.error
                ? "text-xs text-destructive sm:text-sm"
                : "text-xs text-emerald-700 sm:text-sm dark:text-emerald-400"
            }
          >
            {pending ? "Salvando... " : ""}
            {feedback.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsCards({ cards }: { cards: SettingCardData[] }) {
  const byField = new Map(cards.map((card) => [card.field, card]));
  const byDefinition = new Map(
    SETTINGS_DEFINITIONS.map((definition) => [definition.field, definition]),
  );

  function renderCard(field: SettingsField) {
    const data = byField.get(field);
    const definition = byDefinition.get(field);
    if (!data || !definition) return null;
    return <SettingsCard key={field} data={data} definition={definition} />;
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <section aria-label="Configurações principais">
        <div className="mb-2 sm:mb-2.5">
          <h2 className="text-sm font-semibold sm:text-[15px]">Principais</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Dados mais consultados da empresa e do aplicativo.
          </p>
        </div>
        <div className="space-y-3 sm:space-y-3.5">
          {TOP_FIELDS.map(renderCard)}
        </div>
      </section>

      <section aria-label="Configurações avançadas">
        <div className="mb-2 sm:mb-2.5">
          <h2 className="text-sm font-semibold sm:text-[15px]">
            Configurações avançadas
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Conteúdo organizado por tema.
          </p>
        </div>
        <Tabs defaultValue={TAB_GROUPS[0].id} className="w-full gap-3">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1">
            {TAB_GROUPS.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="flex-none px-3 py-1.5 text-xs sm:text-sm"
              >
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TAB_GROUPS.map((group) => (
            <TabsContent key={group.id} value={group.id} className="mt-0">
              <p className="mb-2 text-xs text-muted-foreground">
                {group.description}
              </p>
              <div className="space-y-3 sm:space-y-3.5">
                {group.fields.map(renderCard)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
