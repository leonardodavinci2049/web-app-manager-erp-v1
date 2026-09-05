import {
  CalendarClock,
  Eye,
  Mail,
  MapPin,
  Phone,
  SearchX,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { RegistryLoadMore } from "@/app/dashboard/_components/registry";
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
import type { UICustomerListItem } from "@/services/api-main/customer-general";
import { CustomerImage } from "./customer-image";
import { CustomerPagination } from "./customer-pagination";
import { buildCustomerDetailHref } from "./lib/search-params";
import type {
  CustomerSearchParams,
  CustomerViewMode,
} from "./types/customer-dashboard-types";

interface CustomerCollectionProps {
  items: UICustomerListItem[];
  total: number;
  searchState: CustomerSearchParams;
  viewMode: CustomerViewMode;
  hasLoadError: boolean;
}

function getDocument(customer: UICustomerListItem): string {
  return customer.cnpj || customer.cpf || "Não informado";
}

function getPhone(customer: UICustomerListItem): string {
  return customer.whatsapp || customer.phone || "Não informado";
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(timestamp);
}

function isApproved(value?: string): boolean {
  return ["1", "S", "Y", "SIM", "YES", "APROVADO"].includes(
    value?.trim().toLocaleUpperCase("pt-BR") ?? "",
  );
}

function CustomerBadges({ customer }: { customer: UICustomerListItem }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="secondary">
        {customer.customerType || "Tipo não informado"}
      </Badge>
      <Badge variant={isApproved(customer.approved) ? "default" : "outline"}>
        {isApproved(customer.approved) ? "Aprovado" : "Não aprovado"}
      </Badge>
      {customer.restricted && <Badge variant="destructive">Restrição</Badge>}
    </div>
  );
}

function CustomerCard({
  customer,
  href,
  viewMode,
}: {
  customer: UICustomerListItem;
  href: string;
  viewMode: CustomerViewMode;
}) {
  const horizontal = viewMode === "list";
  return (
    <Card className="group h-full gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent
        className={
          horizontal
            ? "flex items-start gap-3 p-3"
            : "flex h-full flex-col gap-3 p-3 sm:p-4"
        }
      >
        <CustomerImage
          name={customer.name}
          imagePath={customer.imagePath}
          customerId={customer.customerId}
          viewMode={viewMode}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="line-clamp-2 font-semibold">{customer.name}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              ID: {customer.customerId} ·{" "}
              {customer.personType || "Tipo não informado"}
            </p>
            {customer.companyName && (
              <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                {customer.companyName}
              </p>
            )}
          </div>
          <CustomerBadges customer={customer} />
          <div
            className={
              horizontal
                ? "hidden gap-2 text-xs sm:grid sm:grid-cols-2"
                : "grid gap-2 text-xs [&>*:nth-child(n+3)]:hidden"
            }
          >
            <p className="flex items-center gap-2 truncate">
              <Phone className="text-muted-foreground size-3.5 shrink-0" />
              {getPhone(customer)}
            </p>
            <p className="flex items-center gap-2 truncate">
              <Mail className="text-muted-foreground size-3.5 shrink-0" />
              {customer.email || "E-mail não informado"}
            </p>
            <p className="flex items-center gap-2 truncate">
              <MapPin className="text-muted-foreground size-3.5 shrink-0" />
              {customer.city || "Cidade não informada"}
            </p>
            <p className="flex items-center gap-2 truncate">
              <CalendarClock className="text-muted-foreground size-3.5 shrink-0" />
              Última compra: {formatDate(customer.lastPurchase)}
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          variant={horizontal ? "ghost" : undefined}
          className={
            horizontal ? "ml-auto gap-1 self-center" : "mt-0.5 w-full gap-1"
          }
        >
          <Link href={href}>
            <Eye className={horizontal ? "size-4" : "size-3.5"} />
            <span className="sm:hidden">Detalhes</span>
            <span className="hidden sm:inline">Ver detalhes</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function CustomerCollection({
  items,
  total,
  searchState,
  viewMode,
  hasLoadError,
}: CustomerCollectionProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os clientes
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Atualize a página para tentar novamente. Os filtros foram preservados.
        </p>
      </div>
    );
  }

  if (total === 0) {
    const hasFilters =
      searchState.search !== "" ||
      searchState.categoryId !== 0 ||
      searchState.clientType !== 0 ||
      searchState.personType !== 0 ||
      searchState.noImage ||
      searchState.approved !== 0 ||
      searchState.gender !== 0 ||
      searchState.restricted !== 0 ||
      searchState.enabled !== 0 ||
      searchState.statusId !== 0 ||
      searchState.operation !== 0;
    return (
      <div className="flex flex-col items-center py-16 text-center">
        {hasFilters ? (
          <SearchX className="text-muted-foreground mb-4 size-14" />
        ) : (
          <UserRound className="text-muted-foreground mb-4 size-14" />
        )}
        <h2 className="text-lg font-semibold">
          {hasFilters
            ? "Nenhum cliente encontrado"
            : "Nenhum cliente cadastrado"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasFilters
            ? "Revise a pesquisa ou os filtros e tente novamente."
            : "Use a ação “Adicionar cliente” para iniciar o cadastro."}
        </p>
      </div>
    );
  }

  const detailHref = (id: number) => buildCustomerDetailHref(id, searchState);
  const pageStart = searchState.page * searchState.limit + 1;
  const pageEnd = Math.min(
    searchState.page * searchState.limit + items.length,
    total,
  );

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <SearchX className="text-muted-foreground mx-auto mb-3 size-10" />
          <p className="font-medium">Esta página não possui registros.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4">
          {items.map((customer) => (
            <CustomerCard
              key={customer.customerId}
              customer={customer}
              href={detailHref(customer.customerId)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {items.map((customer) => (
              <CustomerCard
                key={customer.customerId}
                customer={customer}
                href={detailHref(customer.customerId)}
                viewMode="list"
              />
            ))}
          </div>
          <div className="hidden min-w-0 max-w-full rounded-xl border lg:block">
            <Table aria-label="Lista de clientes">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14">Imagem</TableHead>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead className="w-56 max-w-[300px] whitespace-normal">
                    Cliente
                  </TableHead>
                  <TableHead className="w-24">Tipo</TableHead>
                  <TableHead className="w-32">Documento</TableHead>
                  <TableHead className="w-32">Contato</TableHead>
                  <TableHead className="w-28">Cidade</TableHead>
                  <TableHead className="w-32">Situação</TableHead>
                  <TableHead className="w-28">Última compra</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
                {items.map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>
                      <CustomerImage
                        name={customer.name}
                        imagePath={customer.imagePath}
                        customerId={customer.customerId}
                        viewMode="list"
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {customer.customerId}
                    </TableCell>
                    <TableCell className="max-w-[300px] whitespace-normal break-words">
                      <Link
                        href={detailHref(customer.customerId)}
                        className="font-medium hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {customer.name}
                      </Link>
                      <p className="text-muted-foreground max-w-[300px] truncate text-xs">
                        {customer.email ||
                          customer.companyName ||
                          "Sem complemento"}
                      </p>
                    </TableCell>
                    <TableCell>{customer.customerType || "—"}</TableCell>
                    <TableCell>{getDocument(customer)}</TableCell>
                    <TableCell>{getPhone(customer)}</TableCell>
                    <TableCell>{customer.city || "Não informada"}</TableCell>
                    <TableCell>
                      <CustomerBadges customer={customer} />
                    </TableCell>
                    <TableCell>{formatDate(customer.lastPurchase)}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={detailHref(customer.customerId)}>
                          <Eye className="size-4" />
                          <span className="sr-only">
                            Ver detalhes de {customer.name}
                          </span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-muted-foreground text-xs tabular-nums">
          Exibindo {Math.min(pageStart, total)}–{pageEnd} de {total}{" "}
          {total === 1 ? "cliente" : "clientes"}
        </p>
        <CustomerPagination
          currentPage={searchState.page}
          total={total}
          pageSize={searchState.limit}
        />
        <RegistryLoadMore
          displayed={items.length}
          total={total}
          label="Carregar mais clientes"
        />
      </div>
    </div>
  );
}
