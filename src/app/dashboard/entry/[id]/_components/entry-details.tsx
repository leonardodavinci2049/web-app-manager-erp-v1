import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  ExternalLink,
  FileText,
  Truck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryStatusBadge } from "../../_components/entry-list/entry-status-badge";
import {
  formatEntryDate,
  formatEntryDateTime,
  formatEntryMoney,
  formatEntryNumber,
} from "../../_components/lib/format";
import { EntryDetailTabs } from "./tabs/entry-detail-tabs";

interface EntryDetailsProps {
  entry: UIEntryDetail;
  returnTo: string;
  imageGallery: ReactNode;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}

/**
 * Detalhe somente leitura da entrada (Server Component). Agrupa os dados em
 * cards de identificacao, fornecedor/transportadora, nota e valores. Tributos,
 * status, resumo e anotacoes ficam organizados em abas abaixo do conteudo
 * principal. A galeria de imagens do fornecedor e' injetada pela pagina via
 * `imageGallery` (no' `<Suspense>`).
 */
export function EntryDetails({
  entry,
  returnTo,
  imageGallery,
}: EntryDetailsProps) {
  const displayTitle = entry.invoiceNumber?.trim()
    ? `Entrada nº ${entry.invoiceNumber}`
    : `Entrada ${entry.id}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm lg:col-span-2 lg:justify-self-start"
        >
          <Link href={returnTo}>
            <ArrowLeft className="size-4" />
            Voltar às entradas
          </Link>
        </Button>

        <div className="flex min-w-0 flex-col gap-2 lg:col-start-2 lg:row-start-2">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold">{displayTitle}</h1>
              <p className="text-muted-foreground text-sm tabular-nums">
                Entrada ID {entry.id}
              </p>
              <p className="text-muted-foreground text-sm">{entry.supplier}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
            <EntryStatusBadge label="Físico" value={entry.physicalStatus} />
            <EntryStatusBadge label="Etiqueta" value={entry.labelStatus} />
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-2 lg:self-start">
          {imageGallery}
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-4 lg:col-start-2 lg:row-start-3">
          <SectionCard
            icon={<CalendarClock className="size-4" />}
            title="Identificação e datas"
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="ID da entrada" value={entry.id} />
              <DetailField label="Usuário" value={entry.userName} />
              <DetailField
                label="Data de entrada"
                value={formatEntryDate(entry.entryDate)}
              />
              <DetailField
                label="Data de lançamento"
                value={formatEntryDate(entry.postingDate)}
              />
              <DetailField
                label="Hora de lançamento"
                value={entry.postingTime}
              />
              <DetailField
                label="Última atualização"
                value={formatEntryDateTime(entry.updatedAt)}
              />
            </dl>
          </SectionCard>

          <SectionCard
            icon={<Truck className="size-4" />}
            title="Fornecedor e transportadora"
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-muted-foreground text-xs">Fornecedor</dt>
                <dd className="mt-1 text-sm font-medium">
                  <Link
                    href={`/dashboard/suppliers/${entry.supplierId}`}
                    className="hover:text-primary focus-visible:outline-none focus-visible:underline"
                  >
                    {entry.supplier}
                    <ExternalLink className="ml-1 inline size-3.5" />
                    <span className="sr-only">Ver fornecedor</span>
                  </Link>
                </dd>
              </div>
              <DetailField label="Transportadora" value={entry.carrier} />
            </dl>
          </SectionCard>

          <SectionCard
            icon={<FileText className="size-4" />}
            title="Nota e modelo"
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Número da nota" value={entry.invoiceNumber} />
              <DetailField label="Modelo" value={entry.model} />
              <div className="sm:col-span-2">
                <DetailField label="Descrição" value={entry.description} />
              </div>
            </dl>
          </SectionCard>

          <SectionCard icon={<Banknote className="size-4" />} title="Valores">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Total da nota"
                value={formatEntryMoney(entry.totalInvoice)}
              />
              <DetailField
                label="Total dos produtos"
                value={formatEntryMoney(entry.totalProducts)}
              />
              <DetailField
                label="Frete"
                value={formatEntryMoney(entry.freightValue)}
              />
              <DetailField
                label="Taxa do frete"
                value={formatEntryNumber(entry.freightRate)}
              />
              <DetailField
                label="Câmbio"
                value={formatEntryNumber(entry.exchangeRate)}
              />
            </dl>
          </SectionCard>
        </div>
      </div>

      <EntryDetailTabs entry={entry} />
    </div>
  );
}
