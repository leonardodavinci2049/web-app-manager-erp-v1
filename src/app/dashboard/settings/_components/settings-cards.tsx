"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingsFieldAction } from "../_actions/settings-actions";
import {
  type JsonObject,
  type JsonValue,
  type PropertyDefinition,
  type ScalarDefinition,
  SETTINGS_DEFINITIONS,
  type SettingCardData,
  type SettingDefinition,
} from "./settings-field-definitions";

type JsonPath = (string | number)[];
type TextOverride = { path: JsonPath; text: string };
type OverrideMap = Record<string, TextOverride>;

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

  function beginEdit() {
    setDraft(prepareDraft(saved.value ?? {}, definition));
    setFreeText(saved.raw ?? "{}");
    setNumberTexts({});
    setJsonTexts({});
    setFeedback(null);
    setEditing(true);
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
          className="flex items-center gap-3 rounded-md border p-3 text-sm"
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
      <div key={pathKey} className="min-w-0 space-y-2">
        <label
          htmlFor={inputId}
          className="block break-all text-sm font-medium"
        >
          {label}
        </label>
        {isLong ? (
          <Textarea
            id={inputId}
            value={text}
            readOnly={!editing || pending}
            onChange={(event) => updateText(event.target.value)}
            rows={type === "json" ? 6 : 3}
            className="font-mono text-sm"
          />
        ) : (
          <Input
            id={inputId}
            value={text}
            readOnly={!editing || pending}
            inputMode={type === "number" ? "decimal" : undefined}
            onChange={(event) => updateText(event.target.value)}
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
      <div className="grid gap-4 sm:grid-cols-2">
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
      <section key={property.key} className="space-y-3 sm:col-span-2">
        <h3 className="text-sm font-semibold break-all">
          {propertyLabel(property.key)} ({value.length})
        </h3>
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum item cadastrado.
          </p>
        )}
        <div className="space-y-4">
          {value.map((item, index) => {
            const rowKey = `${property.key}-${index}`;
            return (
              <div
                key={rowKey}
                className="min-w-0 rounded-lg border bg-muted/20 p-4"
              >
                <p className="mb-3 text-sm font-medium">Item {index + 1}</p>
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

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{definition.title}</CardTitle>
        <CardDescription className="break-all">
          {definition.field}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {malformed && (
          <p role="alert" className="text-sm text-destructive">
            O conteúdo atual não corresponde à estrutura esperada. Revise o JSON
            antes de salvar.
          </p>
        )}
        {freeMode ? (
          <div className="space-y-2">
            <label htmlFor={`${id}-json`} className="block text-sm font-medium">
              Objeto JSON
            </label>
            <Textarea
              id={`${id}-json`}
              value={editing ? freeText : (saved.raw ?? "{}")}
              readOnly={!editing || pending}
              onChange={(event) => setFreeText(event.target.value)}
              rows={10}
              spellCheck={false}
              className="font-mono text-sm"
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
                ? "text-sm text-destructive"
                : "text-sm text-emerald-700 dark:text-emerald-400"
            }
          >
            {feedback.message}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <Button type="button" onClick={save} disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setFeedback(null);
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Button type="button" variant="outline" onClick={beginEdit}>
            Editar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function SettingsCards({ cards }: { cards: SettingCardData[] }) {
  const byField = new Map(cards.map((card) => [card.field, card]));
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {SETTINGS_DEFINITIONS.map((definition) => {
        const data = byField.get(definition.field);
        return data ? (
          <SettingsCard
            key={definition.field}
            data={data}
            definition={definition}
          />
        ) : null;
      })}
    </div>
  );
}
