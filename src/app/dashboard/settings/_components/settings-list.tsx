import {
  CalendarClock,
  Eye,
  Globe2,
  PackageSearch,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettingsAppImage } from "./settings-app-image";
import { buildSettingsDetailHref } from "./settings-list-params";
import { SettingsListToolbar } from "./settings-list-toolbar";
import type {
  SettingsListItem,
  SettingsSearchState,
} from "./settings-list-types";

interface SettingsListProps {
  items: SettingsListItem[];
  searchState: SettingsSearchState;
  hasLoadError: boolean;
}

type ViewMode = "grid" | "list";

function formatUpdatedAt(value: string | null): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return "Não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(timestamp);
}

function ActiveBadge({ value }: { value: number | null }) {
  if (value === 1) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      >
        Ativa
      </Badge>
    );
  }

  if (value === 0) return <Badge variant="destructive">Inativa</Badge>;
  return <Badge variant="secondary">Status não informado</Badge>;
}

function MaintenanceBadge({ value }: { value: number | null }) {
  if (value === 1) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      >
        Em manutenção
      </Badge>
    );
  }

  if (value === 0) return <Badge variant="secondary">Operação normal</Badge>;
  return <Badge variant="secondary">Manutenção não informada</Badge>;
}

function SettingsCard({
  item,
  href,
  viewMode,
  eager,
}: {
  item: SettingsListItem;
  href: string;
  viewMode: ViewMode;
  eager: boolean;
}) {
  const horizontal = viewMode === "list";

  return (
    <Card className="group h-full gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent
        className={
          horizontal
            ? "flex items-start gap-3 p-3 sm:p-4"
            : "flex h-full flex-col gap-3 p-3 sm:p-4"
        }
      >
        <SettingsAppImage
          appName={item.name}
          imagePath={item.imagePath}
          variant={horizontal ? "list" : "grid"}
          eager={eager}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              className="line-clamp-2 font-semibold outline-none hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.name}
            </Link>
            <p className="text-muted-foreground text-xs tabular-nums">
              ID: {item.id}
            </p>
          </div>

          <dl className="grid min-w-0 gap-2 text-xs">
            <div className="flex min-w-0 items-start gap-2">
              <Globe2
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="sr-only">Domínio</dt>
                <dd className="truncate" title={item.domain ?? undefined}>
                  {item.domain ?? "Domínio não informado"}
                </dd>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <CalendarClock
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="sr-only">Última atualização</dt>
                <dd>Atualizada em {formatUpdatedAt(item.updatedAt)}</dd>
              </div>
            </div>
          </dl>

          <div className="flex flex-wrap gap-1.5">
            <ActiveBadge value={item.active} />
            <MaintenanceBadge value={item.maintenance} />
          </div>

          <Button
            asChild
            size="sm"
            variant={horizontal ? "ghost" : "default"}
            className={horizontal ? "self-start" : "mt-auto w-full"}
          >
            <Link href={href}>
              <Eye className="size-4" aria-hidden="true" />
              Ver detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTable({
  items,
  searchState,
}: {
  items: SettingsListItem[];
  searchState: SettingsSearchState;
}) {
  return (
    <div className="min-w-0 max-w-full rounded-lg border">
      <Table aria-label="Lista de configurações">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-16">Imagem</TableHead>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Aplicativo</TableHead>
            <TableHead>Domínio</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Manutenção</TableHead>
            <TableHead>Atualização</TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
          {items.map((item, index) => {
            const href = buildSettingsDetailHref(item.id, searchState);
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <SettingsAppImage
                    appName={item.name}
                    imagePath={item.imagePath}
                    variant="table"
                    eager={index === 0}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {item.id}
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal">
                  <Link
                    href={href}
                    className="font-medium outline-none hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell className="max-w-64 truncate">
                  {item.domain ?? "Não informado"}
                </TableCell>
                <TableCell>
                  <ActiveBadge value={item.active} />
                </TableCell>
                <TableCell>
                  <MaintenanceBadge value={item.maintenance} />
                </TableCell>
                <TableCell>{formatUpdatedAt(item.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={href}>
                      <Eye className="size-4" aria-hidden="true" />
                      <span className="sr-only">
                        Ver detalhes da configuração {item.name}
                      </span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function SettingsCollection({
  items,
  searchState,
  viewMode,
  hasLoadError,
}: SettingsListProps & { viewMode: ViewMode }) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert
          className="mb-4 size-14 text-destructive"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar as configurações
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Atualize a página para tentar novamente. A pesquisa foi preservada.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    const hasSearch = searchState.search !== "";
    const EmptyIcon = hasSearch ? SearchX : PackageSearch;
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <EmptyIcon
          className="mb-4 size-16 text-muted-foreground"
          aria-hidden="true"
        />
        <h2 className="mb-2 text-lg font-semibold">
          {hasSearch
            ? "Nenhuma configuração encontrada"
            : "Nenhuma configuração cadastrada"}
        </h2>
        <p className="max-w-md text-muted-foreground">
          {hasSearch
            ? "Não encontramos configurações que correspondam à pesquisa. Tente outro nome ou ID."
            : "Não há configurações disponíveis para este cliente de sistema."}
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <SettingsCard
            key={item.id}
            item={item}
            href={buildSettingsDetailHref(item.id, searchState)}
            viewMode="grid"
            eager={index < 3}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.map((item, index) => (
          <SettingsCard
            key={item.id}
            item={item}
            href={buildSettingsDetailHref(item.id, searchState)}
            viewMode="list"
            eager={index === 0}
          />
        ))}
      </div>
      <div className="hidden lg:block">
        <SettingsTable items={items} searchState={searchState} />
      </div>
    </>
  );
}

export function SettingsList(props: SettingsListProps) {
  const grid = <SettingsCollection {...props} viewMode="grid" />;
  const list = <SettingsCollection {...props} viewMode="list" />;

  return (
    <SettingsListToolbar
      searchState={props.searchState}
      grid={grid}
      list={list}
    />
  );
}
