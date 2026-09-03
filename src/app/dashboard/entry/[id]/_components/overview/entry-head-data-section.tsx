import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryImage } from "../../../_components/entry-list/entry-image";
import { EntryStatusBadge } from "../../../_components/entry-list/entry-status-badge";

interface EntryHeadDataSectionProps {
  entry: Pick<
    UIEntryDetail,
    | "id"
    | "invoiceNumber"
    | "supplier"
    | "imagePath"
    | "stockStatus"
    | "physicalStatus"
    | "labelStatus"
  >;
}

export function EntryHeadDataSection({ entry }: EntryHeadDataSectionProps) {
  const displayTitle = entry.invoiceNumber?.trim()
    ? `Entrada nº ${entry.invoiceNumber}`
    : `Entrada ${entry.id}`;

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
            {displayTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm tabular-nums">
            Entrada ID {entry.id}
          </p>
          <p className="text-muted-foreground text-sm">{entry.supplier}</p>
        </>
      }
      metadata={
        <>
          <EntryStatusBadge label="Estoque" value={entry.stockStatus} />
          <EntryStatusBadge label="Físico" value={entry.physicalStatus} />
          <EntryStatusBadge label="Etiqueta" value={entry.labelStatus} />
        </>
      }
    />
  );
}
