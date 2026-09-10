import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryImage } from "../../../_components/entry-list/entry-image";
import { EntryStatusBadge } from "../../../_components/entry-list/entry-status-badge";
import { formatEntryDate } from "../../../_components/lib/format";

interface EntryHeadDataSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "id"
    | "invoiceNumber"
    | "supplier"
    | "carrier"
    | "userName"
    | "entryDate"
    | "imagePath"
    | "stockStatus"
    | "physicalStatus"
    | "labelStatus"
  >;
}

export function EntryHeadDataSection({ entry }: EntryHeadDataSectionProps) {
  const carrierName = entry.carrier?.trim() || "Não informado";
  const userName = entry.userName?.trim() || "Não informado";

  return (
    <DetailRecordHeading
      mobileImage={
        <EntryImage
          name={entry.supplier}
          imagePath={entry.imagePath}
          viewMode="list"
        />
      }
      title={
        <>
          <h1 className="break-words text-xl font-bold sm:text-2xl">
            {`Entrada ID: ${entry.id}`}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {`Nota Nº: ${entry.invoiceNumber}`}
          </p>
          <p className="mt-1 text-sm font-medium">
            Fornecedor: {entry.supplier}</p>
          <p className="text-muted-foreground text-sm">
            {`Transportadora: ${carrierName}`}
          </p>
          <p className="text-muted-foreground text-sm">{`Usuário: ${userName}`}</p>
        </>
      }
      metadata={
        <>
          <span className="tabular-nums">{`Data: ${formatEntryDate(entry.entryDate)}`}</span>
          <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
          <EntryStatusBadge label="Físico" value={entry.physicalStatus} />
          <EntryStatusBadge label="Etiqueta" value={entry.labelStatus} />
        </>
      }
    />
  );
}
