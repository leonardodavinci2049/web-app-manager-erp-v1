import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import type { UIPtype } from "@/services/api-main/ptype";
import { PtypeImage } from "../../../_components/ptype-image";

interface PtypeHeadDataSectionProps {
  item: Pick<UIPtype, "id" | "name" | "imagePath" | "inactive">;
}

export function PtypeHeadDataSection({ item }: PtypeHeadDataSectionProps) {
  return (
    <DetailRecordHeading
      mobileImage={
        <PtypeImage
          name={item.name}
          imagePath={item.imagePath}
          viewMode="list"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">
          {item.name}
        </h1>
      }
      metadata={
        <>
          <Badge variant={item.inactive ? "destructive" : "secondary"}>
            {item.inactive ? "Inativo" : "Ativo"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Tipo de produto ID {item.id}</span>
        </>
      }
    />
  );
}
