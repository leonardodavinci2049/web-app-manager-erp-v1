"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Circle,
  FolderTree,
  ImagePlus,
  Link2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  Unlink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createCategoryAction,
  deleteCategoryAction,
  linkProductAction,
  moveCategoryAction,
  toggleCategoryStatusAction,
  unlinkProductAction,
  updateCategoryAction,
} from "../_actions/category-actions";
import type {
  CategoryDetailDto,
  CategoryFilterLevel,
  CategoryFilterStatus,
  CategoryNodeDto,
  CategoryProductDto,
  CategoryStatsDto,
} from "./category-types";

const LEVEL_LABELS = { 1: "Família", 2: "Grupo", 3: "Subgrupo" } as const;
const LEVEL_BADGES = { 1: "FAM", 2: "GRU", 3: "SUB" } as const;

interface CategoryDashboardProps {
  tree: CategoryNodeDto[];
  flatCategories: CategoryNodeDto[];
  stats: CategoryStatsDto;
  detail?: CategoryDetailDto;
  products: CategoryProductDto[];
  productTotal: number;
  initialSearch: string;
  initialLevel: CategoryFilterLevel;
  initialStatus: CategoryFilterStatus;
  initialWithoutProducts: boolean;
  initialIssue: string;
  initialTab: "details" | "products";
  productSearch: string;
  dataError?: string;
}

function updateQuery(
  updates: Record<string, string | undefined>,
  router: ReturnType<typeof useRouter>,
) {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  router.push(
    query ? `${window.location.pathname}?${query}` : window.location.pathname,
  );
}

function LevelBadge({ level }: { level: 1 | 2 | 3 }) {
  return (
    <Badge
      variant={level === 1 ? "default" : level === 2 ? "secondary" : "outline"}
      className="h-5 rounded-sm px-1.5 text-[10px] tracking-wide"
    >
      {LEVEL_BADGES[level]}
    </Badge>
  );
}

function includesNode(
  node: CategoryNodeDto,
  predicate: (node: CategoryNodeDto) => boolean,
): boolean {
  return (
    predicate(node) ||
    node.children.some((child) => includesNode(child, predicate))
  );
}

function getVisibleRows(
  tree: CategoryNodeDto[],
  expanded: Set<number>,
  predicate: (node: CategoryNodeDto) => boolean,
  forceAncestors: boolean,
) {
  const rows: Array<{ node: CategoryNodeDto; depth: number }> = [];
  const visit = (nodes: CategoryNodeDto[], depth: number) => {
    for (const node of nodes) {
      if (!includesNode(node, predicate)) continue;
      rows.push({ node, depth });
      if (
        (expanded.has(node.id) || forceAncestors) &&
        node.children.length > 0
      ) {
        visit(node.children, depth + 1);
      }
    }
  };
  visit(tree, 0);
  return rows;
}

function StatStrip({
  stats,
  onFilter,
}: {
  stats: CategoryStatsDto;
  onFilter: (filter: string) => void;
}) {
  const items = [
    ["Total categorias", stats.total, "all"],
    ["Famílias", stats.families, "level-1"],
    ["Grupos", stats.groups, "level-2"],
    ["Subgrupos", stats.subgroups, "level-3"],
    ["Ativas", stats.active, "active"],
    ["Inativas", stats.inactive, "inactive"],
    ["Sem produtos", stats.withoutProducts, "without-products"],
    ["Fam. sem grupos", stats.familiesWithoutGroups, "family-empty"],
    ["Grupos sem sub.", stats.groupsWithoutSubgroups, "group-empty"],
    ["Inconsistências", stats.inconsistencies, "inconsistent"],
  ] as const;
  return (
    <section
      className="flex overflow-x-auto border-y bg-card"
      aria-label="Indicadores de categorias"
    >
      {items.map(([label, value, filter]) => (
        <button
          type="button"
          key={label}
          onClick={() => onFilter(filter)}
          className={cn(
            "min-w-28 shrink-0 border-r px-3 py-2.5 text-center transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            filter === "inconsistent" && value > 0 && "bg-destructive/5",
          )}
        >
          <span
            className={cn(
              "block text-lg font-bold leading-none",
              filter === "inconsistent" && value > 0 && "text-destructive",
            )}
          >
            {value}
          </span>
          <span className="mt-1 block whitespace-nowrap text-[10px] text-muted-foreground">
            {label}
          </span>
        </button>
      ))}
    </section>
  );
}

interface CategoryTreeProps {
  tree: CategoryNodeDto[];
  selectedId?: number;
  initialSearch: string;
  initialLevel: CategoryFilterLevel;
  initialStatus: CategoryFilterStatus;
  initialWithoutProducts: boolean;
  initialIssue: string;
  onSelect: (id: number) => void;
  onFilters: (filters: {
    search?: string;
    level?: string;
    status?: string;
    withoutProducts?: string;
    issue?: string;
  }) => void;
}

function CategoryTree({
  tree,
  selectedId,
  initialSearch,
  initialLevel,
  initialStatus,
  initialWithoutProducts,
  initialIssue,
  onSelect,
  onFilters,
}: CategoryTreeProps) {
  const allParentIds = useMemo(() => {
    const ids = new Set<number>();
    const collect = (nodes: CategoryNodeDto[]) =>
      nodes.forEach((node) => {
        if (node.children.length) ids.add(node.id);
        collect(node.children);
      });
    collect(tree);
    return ids;
  }, [tree]);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [search, setSearch] = useState(initialSearch);
  const [level, setLevel] = useState<CategoryFilterLevel>(initialLevel);
  const [status, setStatus] = useState<CategoryFilterStatus>(initialStatus);
  const [withoutProducts, setWithoutProducts] = useState(
    initialWithoutProducts,
  );
  const [issue, setIssue] = useState(initialIssue);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSearch(initialSearch), [initialSearch]);
  useEffect(() => setLevel(initialLevel), [initialLevel]);
  useEffect(() => setStatus(initialStatus), [initialStatus]);
  useEffect(
    () => setWithoutProducts(initialWithoutProducts),
    [initialWithoutProducts],
  );
  useEffect(() => setIssue(initialIssue), [initialIssue]);

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const predicate = (node: CategoryNodeDto) =>
    (!normalizedSearch ||
      node.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      String(node.id).includes(normalizedSearch)) &&
    (level === "all" || String(node.level) === level) &&
    (status === "all" || node.status === status) &&
    (!withoutProducts || node.directProductCount === 0) &&
    (issue !== "family-empty" ||
      (node.level === 1 && node.children.length === 0)) &&
    (issue !== "group-empty" ||
      (node.level === 2 && node.children.length === 0)) &&
    (issue !== "inconsistent" || node.inconsistent);
  const rows = getVisibleRows(
    tree,
    expanded,
    predicate,
    Boolean(
      normalizedSearch ||
        level !== "all" ||
        status !== "all" ||
        withoutProducts ||
        issue,
    ),
  );

  const commitFilters = (
    next: Partial<{
      search: string;
      level: CategoryFilterLevel;
      status: CategoryFilterStatus;
      withoutProducts: boolean;
      issue: string;
    }>,
  ) => {
    const value = { search, level, status, withoutProducts, issue, ...next };
    onFilters({
      search: value.search.trim() || undefined,
      level: value.level === "all" ? undefined : value.level,
      status: value.status === "all" ? undefined : value.status,
      withoutProducts: value.withoutProducts ? "1" : undefined,
      issue: value.issue || undefined,
    });
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
    node: CategoryNodeDto,
  ) => {
    const focusRow = (nextIndex: number) => {
      const elements =
        treeRef.current?.querySelectorAll<HTMLElement>("[role=treeitem]");
      elements?.[
        Math.max(0, Math.min(nextIndex, (elements?.length ?? 1) - 1))
      ]?.focus();
    };
    if (event.key === "ArrowDown") focusRow(index + 1);
    else if (event.key === "ArrowUp") focusRow(index - 1);
    else if (event.key === "ArrowRight" && node.children.length)
      setExpanded((current) => new Set(current).add(node.id));
    else if (event.key === "ArrowLeft" && expanded.has(node.id))
      setExpanded((current) => {
        const next = new Set(current);
        next.delete(node.id);
        return next;
      });
    else if (event.key === "Enter" || event.key === " ") onSelect(node.id);
    else return;
    event.preventDefault();
  };

  return (
    <aside className="flex min-h-0 flex-col border-r bg-card md:w-[300px] md:min-w-[260px]">
      <div className="space-y-3 border-b p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            commitFilters({ search });
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou ID…"
            className="h-9 pl-8"
            aria-label="Buscar categorias"
          />
        </form>
        <fieldset
          className="flex gap-1 overflow-x-auto"
          aria-label="Filtrar por nível"
        >
          {(["all", "1", "2", "3"] as const).map((value) => (
            <Button
              key={value}
              size="xs"
              variant={level === value ? "default" : "outline"}
              onClick={() => {
                setLevel(value);
                setIssue("");
                commitFilters({ level: value, issue: "" });
              }}
            >
              {value === "all"
                ? "Todos"
                : LEVEL_LABELS[Number(value) as 1 | 2 | 3]}
            </Button>
          ))}
        </fieldset>
        <fieldset
          className="flex gap-1 overflow-x-auto"
          aria-label="Filtrar por status"
        >
          {(["all", "active", "inactive"] as const).map((value) => (
            <Button
              key={value}
              size="xs"
              variant={status === value ? "secondary" : "outline"}
              onClick={() => {
                setStatus(value);
                setIssue("");
                commitFilters({ status: value, issue: "" });
              }}
            >
              {value === "all"
                ? "Qualquer status"
                : value === "active"
                  ? "Ativas"
                  : "Inativas"}
            </Button>
          ))}
          <Button
            size="xs"
            variant={withoutProducts ? "secondary" : "outline"}
            onClick={() => {
              const next = !withoutProducts;
              setWithoutProducts(next);
              setIssue("");
              commitFilters({ withoutProducts: next, issue: "" });
            }}
          >
            Sem produtos
          </Button>
        </fieldset>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setExpanded(new Set(allParentIds))}
          >
            <ChevronsUpDown className="size-3" /> Expandir tudo
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setExpanded(new Set())}
          >
            <ChevronsDownUp className="size-3" /> Recolher tudo
          </button>
        </div>
      </div>
      <div
        ref={treeRef}
        role="tree"
        aria-label="Hierarquia de categorias"
        className="min-h-64 flex-1 overflow-y-auto"
      >
        {rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria corresponde aos filtros.
          </div>
        ) : (
          rows.map(({ node, depth }, index) => {
            const hasChildren = node.children.length > 0;
            const isExpanded = expanded.has(node.id);
            const isSelected = selectedId === node.id;
            return (
              <div
                key={node.id}
                role="treeitem"
                tabIndex={isSelected || (!selectedId && index === 0) ? 0 : -1}
                aria-level={node.level}
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-selected={isSelected}
                onKeyDown={(event) => handleKeyDown(event, index, node)}
                onClick={() => onSelect(node.id)}
                className={cn(
                  "group flex min-h-11 cursor-pointer items-center gap-1.5 border-b px-2 text-sm outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isSelected && "border-l-2 border-l-foreground bg-muted",
                  node.inconsistent && "bg-destructive/5",
                )}
                style={{ paddingLeft: 8 + depth * 16 }}
              >
                <button
                  type="button"
                  aria-label={
                    isExpanded ? "Recolher categoria" : "Expandir categoria"
                  }
                  className="flex size-7 shrink-0 items-center justify-center rounded hover:bg-muted"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!hasChildren) return;
                    setExpanded((current) => {
                      const next = new Set(current);
                      if (next.has(node.id)) next.delete(node.id);
                      else next.add(node.id);
                      return next;
                    });
                  }}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )
                  ) : null}
                </button>
                <LevelBadge level={node.level} />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    node.status === "inactive" &&
                      "text-muted-foreground line-through",
                  )}
                >
                  {node.name}
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                  {node.directProductCount}p
                </span>
                {node.inconsistent && (
                  <AlertTriangle
                    className="size-3.5 shrink-0 text-destructive"
                    aria-label={node.issues.join("; ")}
                  />
                )}
                <Circle
                  className={cn(
                    "size-2 shrink-0",
                    node.status === "active"
                      ? "fill-emerald-500 text-emerald-500"
                      : "fill-muted text-muted-foreground",
                  )}
                  aria-label={node.status === "active" ? "Ativa" : "Inativa"}
                />
                <MoreHorizontal
                  className="size-4 opacity-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap gap-3 border-t p-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Circle className="size-2 fill-emerald-500 text-emerald-500" /> Ativa
        </span>
        <span className="flex items-center gap-1">
          <Circle className="size-2 fill-muted text-muted-foreground" /> Inativa
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="size-3 text-destructive" /> Inconsistente
        </span>
      </div>
    </aside>
  );
}

const detailFormSchema = z.object({
  name: z.string().trim().min(2, "Informe ao menos 2 caracteres.").max(100),
  slug: z.string().trim().min(1, "Informe o slug.").max(300),
  order: z.number().int().min(1, "A ordem deve ser maior que zero."),
  metaTitle: z.string().max(300),
  metaDescription: z.string().max(500),
  notes: z.string().max(2000),
});
type DetailFormValues = z.infer<typeof detailFormSchema>;

function DetailsForm({
  detail,
  categories,
  onMove,
  onDelete,
}: {
  detail: CategoryDetailDto;
  categories: CategoryNodeDto[];
  onMove: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<DetailFormValues>({
    resolver: zodResolver(detailFormSchema),
    defaultValues: {
      name: detail.name,
      slug: detail.slug,
      order: detail.order,
      metaTitle: detail.metaTitle,
      metaDescription: detail.metaDescription,
      notes: detail.notes,
    },
  });
  useEffect(
    () =>
      form.reset({
        name: detail.name,
        slug: detail.slug,
        order: detail.order,
        metaTitle: detail.metaTitle,
        metaDescription: detail.metaDescription,
        notes: detail.notes,
      }),
    [detail, form],
  );
  const parent = categories.find((item) => item.id === detail.parentId);

  const submit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateCategoryAction({
        ...values,
        id: detail.id,
        parentId: detail.parentId,
        imagePath: detail.imagePath ?? "",
        inactive: detail.status === "inactive",
      });
      result.success
        ? toast.success(result.message)
        : toast.error(result.message);
      if (result.success) router.refresh();
    }),
  );

  return (
    <form id="category-detail-form" onSubmit={submit} className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="category-name">Nome</Label>
          <Input
            id="category-name"
            {...form.register("name")}
            aria-invalid={Boolean(form.formState.errors.name)}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-slug">Slug</Label>
          <Input id="category-slug" {...form.register("slug")} />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-order">Ordem</Label>
          <Input
            id="category-order"
            type="number"
            min={1}
            {...form.register("order", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-id">ID</Label>
          <Input
            id="category-id"
            value={detail.id}
            readOnly
            className="bg-muted font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Input
            value={detail.status === "active" ? "Ativa" : "Inativa"}
            readOnly
            className="bg-muted"
          />
        </div>
      </section>
      <Separator />
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Imagem de capa</h3>
          <p className="text-xs text-muted-foreground">
            O upload será disponibilizado após a integração com o serviço de
            arquivos.
          </p>
        </div>
        <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed bg-muted/30 p-4">
          <div className="text-center">
            <ImagePlus className="mx-auto mb-2 size-6 text-muted-foreground" />
            <p className="text-xs">
              {detail.imagePath || "Nenhuma imagem cadastrada"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              disabled
            >
              Selecionar imagem
            </Button>
          </div>
        </div>
      </section>
      <Separator />
      <section className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="meta-title">Meta título</Label>
          <Input id="meta-title" {...form.register("metaTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta descrição</Label>
          <Textarea
            id="meta-description"
            rows={3}
            {...form.register("metaDescription")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Anotações internas</Label>
          <Textarea id="notes" rows={4} {...form.register("notes")} />
        </div>
      </section>
      <section className="rounded-md border bg-muted/20 p-4">
        <h3 className="text-sm font-semibold">Categoria pai</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Caminho atual: {parent?.name ?? "Raiz"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onMove}
          disabled={detail.level === 1}
        >
          Mover categoria
        </Button>
      </section>
      <section className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
        <h3 className="text-sm font-semibold text-destructive">
          Zona de perigo
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await toggleCategoryStatusAction(detail.id);
                result.success
                  ? toast.success(result.message)
                  : toast.error(result.message);
                if (result.success) router.refresh();
              })
            }
          >
            {detail.status === "active"
              ? "Inativar categoria"
              : "Ativar categoria"}
          </Button>
          <Button type="button" variant="destructive" onClick={onDelete}>
            <Trash2 /> Excluir categoria
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Categorias com filhos ou produtos vinculados não podem ser excluídas.
        </p>
      </section>
      <div aria-live="polite" className="sr-only">
        {pending ? "Salvando categoria" : ""}
      </div>
    </form>
  );
}

function ProductsTab({
  detail,
  products,
  total,
  productSearch,
  onMassLink,
}: {
  detail: CategoryDetailDto;
  products: CategoryProductDto[];
  total: number;
  productSearch: string;
  onMassLink: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(productSearch);
  const [productId, setProductId] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold">
            {total} produtos vinculados diretamente
          </h3>
          <p className="text-xs text-muted-foreground">
            A contagem agregada e a origem aguardam contrato de API.
          </p>
        </div>
        <Button variant="outline" onClick={onMassLink}>
          <Link2 /> Vincular em massa
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateQuery(
              {
                productSearch: search.trim() || undefined,
                productPage: undefined,
              },
              router,
            );
          }}
          className="relative"
        >
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar nos produtos vinculados…"
            className="pl-8"
          />
        </form>
        <Input
          inputMode="numeric"
          value={productId}
          onChange={(event) =>
            setProductId(event.target.value.replace(/\D/g, ""))
          }
          placeholder="ID do produto"
          aria-label="ID do produto para vincular"
        />
        <Button
          disabled={pending || !productId}
          onClick={() =>
            startTransition(async () => {
              const result = await linkProductAction({
                categoryId: detail.id,
                productId: Number(productId),
              });
              result.success
                ? toast.success(result.message)
                : toast.error(result.message);
              if (result.success) {
                setProductId("");
                router.refresh();
              }
            })
          }
        >
          <Plus /> Vincular
        </Button>
      </div>
      {products.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">
            {productSearch
              ? "Nenhum produto corresponde à busca"
              : "Esta categoria ainda não tem produtos"}
          </p>
          {productSearch && (
            <Button
              variant="link"
              onClick={() => updateQuery({ productSearch: undefined }, router)}
            >
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <div className="hidden grid-cols-[1fr_120px_160px_100px_48px] gap-3 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground md:grid">
            <span>Produto</span>
            <span>SKU</span>
            <span>EAN</span>
            <span>Marca</span>
            <span />
          </div>
          {products.map((product) => (
            <div
              key={product.id}
              className="grid gap-2 border-t p-3 first:border-t-0 md:grid-cols-[1fr_120px_160px_100px_48px] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground md:hidden">
                  SKU {product.sku} · {product.brand}
                </p>
              </div>
              <span className="hidden text-xs font-mono md:block">
                {product.sku}
              </span>
              <span className="hidden text-xs font-mono md:block">
                {product.ean || "—"}
              </span>
              <span className="hidden truncate text-xs md:block">
                {product.brand}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Desvincular ${product.name}`}
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await unlinkProductAction({
                      categoryId: detail.id,
                      productId: product.id,
                    });
                    result.success
                      ? toast.success(result.message)
                      : toast.error(result.message);
                    if (result.success) router.refresh();
                  })
                }
              >
                <Unlink />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreationDialog({
  open,
  onOpenChange,
  parent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent?: CategoryDetailDto;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const parentId = parent && parent.level < 3 ? parent.id : 0;
  const label =
    parentId === 0 ? "família" : parent?.level === 1 ? "grupo" : "subgrupo";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova {label}</DialogTitle>
          <DialogDescription>
            {parentId
              ? `Será criada dentro de ${parent?.name}.`
              : "Será criada no primeiro nível da hierarquia."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-category-name">Nome</Label>
          <Input
            id="new-category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={pending || name.trim().length < 2}
            onClick={() =>
              startTransition(async () => {
                const result = await createCategoryAction({ name, parentId });
                result.success
                  ? toast.success(result.message)
                  : toast.error(result.message);
                if (result.success) {
                  onOpenChange(false);
                  setName("");
                  updateQuery(
                    {
                      categoryId: result.categoryId
                        ? String(result.categoryId)
                        : undefined,
                    },
                    router,
                  );
                  router.refresh();
                }
              })
            }
          >
            Criar {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MoveDialog({
  open,
  onOpenChange,
  detail,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: CategoryDetailDto;
  categories: CategoryNodeDto[];
}) {
  const router = useRouter();
  const candidates =
    detail.level === 1
      ? []
      : categories.filter(
          (item) => item.level === detail.level - 1 && item.id !== detail.id,
        );
  const [parentId, setParentId] = useState(detail.parentId);
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover categoria</DialogTitle>
          <DialogDescription>
            Escolha uma nova categoria pai compatível com o nível{" "}
            {LEVEL_LABELS[detail.level]}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-1">
          {candidates.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setParentId(item.id)}
              className={cn(
                "flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-muted",
                parentId === item.id && "bg-muted font-medium",
              )}
            >
              <span>{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                #{item.id}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Novo caminho:{" "}
          {categories.find((item) => item.id === parentId)?.name ??
            "Selecione um destino"}{" "}
          › {detail.name}
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={pending || parentId === detail.parentId}
            onClick={() =>
              startTransition(async () => {
                const result = await moveCategoryAction({
                  categoryId: detail.id,
                  parentId,
                });
                result.success
                  ? toast.success(result.message)
                  : toast.error(result.message);
                if (result.success) {
                  onOpenChange(false);
                  router.refresh();
                }
              })
            }
          >
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  detail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: CategoryDetailDto;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const blocked = detail.childCount > 0 || detail.directProductCount > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir categoria</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        {blocked ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">
              Não é possível excluir.
            </p>
            {detail.childCount > 0 && (
              <p className="mt-1">
                A categoria possui {detail.childCount} filha(s).
              </p>
            )}
            {detail.directProductCount > 0 && (
              <p className="mt-1">
                A categoria possui {detail.directProductCount} produto(s)
                vinculado(s).
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-md border bg-muted/30 p-3 text-sm">
            <strong>{detail.name}</strong> (#{detail.id}) será removida
            permanentemente.
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={blocked || pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteCategoryAction(detail.id);
                result.success
                  ? toast.success(result.message)
                  : toast.error(result.message);
                if (result.success) {
                  onOpenChange(false);
                  updateQuery(
                    {
                      categoryId: detail.parentId
                        ? String(detail.parentId)
                        : undefined,
                    },
                    router,
                  );
                  router.refresh();
                }
              })
            }
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MassLinkPreviewDialog({
  open,
  onOpenChange,
  detail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: CategoryDetailDto;
}) {
  const [step, setStep] = useState(1);
  const labels = ["Destino", "Busca", "Prévia", "Confirmação"];
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setStep(1);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular produtos em massa</DialogTitle>
          <DialogDescription>
            Fluxo em prévia. Nenhuma alteração será executada até existir o
            endpoint em lote.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 border-y">
          {labels.map((label, index) => (
            <div
              key={label}
              className={cn(
                "p-2 text-center text-xs",
                step === index + 1 && "bg-muted font-medium",
              )}
            >
              <span className="mr-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                {index + 1}
              </span>
              {label}
            </div>
          ))}
        </div>
        <div className="min-h-48 rounded-md border border-dashed p-6">
          {step === 1 && (
            <div>
              <h4 className="font-medium">Categoria de destino</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                {detail.breadcrumb.map((item) => item.name).join(" › ")}
              </p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h4 className="font-medium">Busca server-side</h4>
              <Input
                className="mt-3"
                placeholder="Nome, SKU, EAN, referência, modelo ou marca…"
                disabled
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Os controles serão ativados com o contrato do endpoint.
              </p>
            </div>
          )}
          {step === 3 && (
            <div>
              <h4 className="font-medium">Prévia de vínculos</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Encontrados, já vinculados, selecionados e novos serão exibidos
                aqui sem dados simulados.
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
              <h4 className="font-medium">Operação indisponível</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                A confirmação ficará disponível após a API oferecer limite,
                idempotência e retorno parcial.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              step === 1 ? onOpenChange(false) : setStep(step - 1)
            }
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <Button onClick={() => setStep(step + 1)} disabled={step === 4}>
            {step === 4 ? "Aguardando API" : "Próximo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryDashboard(props: CategoryDashboardProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [massOpen, setMassOpen] = useState(false);
  const select = (id: number) =>
    updateQuery({ categoryId: String(id) }, router);
  const setFilters = (filters: {
    search?: string;
    level?: string;
    status?: string;
    withoutProducts?: string;
    issue?: string;
  }) => updateQuery(filters, router);
  const statFilter = (filter: string) => {
    if (filter === "all")
      setFilters({
        search: undefined,
        level: undefined,
        status: undefined,
        withoutProducts: undefined,
        issue: undefined,
      });
    else if (filter.startsWith("level-"))
      setFilters({
        level: filter.slice(-1),
        status: undefined,
        withoutProducts: undefined,
        issue: undefined,
      });
    else if (filter === "active" || filter === "inactive")
      setFilters({
        status: filter,
        level: undefined,
        withoutProducts: undefined,
        issue: undefined,
      });
    else if (filter === "without-products")
      setFilters({
        withoutProducts: "1",
        level: undefined,
        status: undefined,
        issue: undefined,
      });
    else if (filter === "family-empty")
      setFilters({
        level: undefined,
        withoutProducts: undefined,
        status: undefined,
        issue: "family-empty",
      });
    else if (filter === "group-empty")
      setFilters({
        level: undefined,
        withoutProducts: undefined,
        status: undefined,
        issue: "group-empty",
      });
    else
      setFilters({
        search: undefined,
        level: undefined,
        status: undefined,
        withoutProducts: undefined,
        issue: "inconsistent",
      });
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex flex-col justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center lg:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Gerenciamento de categorias
          </h1>
          <p className="text-xs text-muted-foreground">
            Famílias, grupos, subgrupos e seus produtos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nova família
        </Button>
      </div>
      {props.dataError && (
        <div className="mx-3 mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive lg:mx-6">
          {props.dataError}
        </div>
      )}
      <StatStrip stats={props.stats} onFilter={statFilter} />
      {props.tree.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <FolderTree className="mx-auto mb-3 size-10 text-muted-foreground" />
            <h2 className="font-semibold">Nenhuma categoria cadastrada</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie uma família para iniciar a hierarquia.
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus /> Nova família
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid min-h-[600px] flex-1 md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
          <div className={cn("min-h-0", props.detail && "hidden md:block")}>
            <CategoryTree
              tree={props.tree}
              selectedId={props.detail?.id}
              initialSearch={props.initialSearch}
              initialLevel={props.initialLevel}
              initialStatus={props.initialStatus}
              initialWithoutProducts={props.initialWithoutProducts}
              initialIssue={props.initialIssue}
              onSelect={select}
              onFilters={setFilters}
            />
          </div>
          <main
            className={cn("min-w-0 bg-card", !props.detail && "hidden md:flex")}
          >
            {!props.detail ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <FolderTree className="mb-3 size-10" />
                <p>Selecione uma categoria na árvore para ver os detalhes.</p>
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b px-4 py-3 lg:px-6">
                  <button
                    type="button"
                    className="mb-3 flex min-h-11 items-center gap-2 text-sm text-muted-foreground md:hidden"
                    onClick={() =>
                      updateQuery({ categoryId: undefined }, router)
                    }
                  >
                    <ArrowLeft className="size-4" /> Voltar para categorias
                  </button>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                        {props.detail.breadcrumb.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => select(item.id)}
                            className="hover:text-foreground"
                          >
                            {index > 0 && <span className="mr-1">›</span>}
                            {item.name}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          {props.detail.name}
                        </h2>
                        <LevelBadge level={props.detail.level} />
                        <Badge variant="outline">
                          {props.detail.status === "active"
                            ? "Ativa"
                            : "Inativa"}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          #{props.detail.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {props.detail.level < 3 && (
                        <Button
                          variant="outline"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Plus /> Novo{" "}
                          {props.detail.level === 1 ? "grupo" : "subgrupo"}
                        </Button>
                      )}
                      <Button
                        type="submit"
                        form="category-detail-form"
                        className={cn(
                          props.initialTab !== "details" && "hidden",
                        )}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex border-b px-4 lg:px-6">
                  <button
                    type="button"
                    onClick={() => updateQuery({ tab: undefined }, router)}
                    className={cn(
                      "border-b-2 px-4 py-3 text-sm",
                      props.initialTab === "details"
                        ? "border-foreground font-medium"
                        : "border-transparent text-muted-foreground",
                    )}
                  >
                    Detalhes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateQuery({ tab: "products" }, router)}
                    className={cn(
                      "border-b-2 px-4 py-3 text-sm",
                      props.initialTab === "products"
                        ? "border-foreground font-medium"
                        : "border-transparent text-muted-foreground",
                    )}
                  >
                    Produtos
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Em breve"
                    className="px-4 py-3 text-sm text-muted-foreground opacity-40"
                  >
                    Histórico
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6">
                  {props.initialTab === "details" ? (
                    <DetailsForm
                      detail={props.detail}
                      categories={props.flatCategories}
                      onMove={() => setMoveOpen(true)}
                      onDelete={() => setDeleteOpen(true)}
                    />
                  ) : (
                    <ProductsTab
                      detail={props.detail}
                      products={props.products}
                      total={props.productTotal}
                      productSearch={props.productSearch}
                      onMassLink={() => setMassOpen(true)}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
      <CreationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parent={props.detail}
      />
      {props.detail && (
        <>
          <MoveDialog
            open={moveOpen}
            onOpenChange={setMoveOpen}
            detail={props.detail}
            categories={props.flatCategories}
          />
          <DeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            detail={props.detail}
          />
          <MassLinkPreviewDialog
            open={massOpen}
            onOpenChange={setMassOpen}
            detail={props.detail}
          />
        </>
      )}
    </div>
  );
}
