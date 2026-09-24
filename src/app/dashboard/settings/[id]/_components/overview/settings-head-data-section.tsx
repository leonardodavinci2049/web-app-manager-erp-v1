import { DetailRecordHeading } from "@/app/dashboard/_components/detail-page";
import { Badge } from "@/components/ui/badge";
import { SettingsAppImage } from "../../../_components/settings-app-image";
import type { SettingsDetailData } from "../settings-detail-types";

interface SettingsHeadDataSectionProps {
  config: SettingsDetailData;
}

export function SettingsHeadDataSection({
  config,
}: SettingsHeadDataSectionProps) {
  const appName = config.name?.trim() || `Configuração ${config.id}`;
  const domain = config.domain?.trim() || "Domínio não informado";

  return (
    <DetailRecordHeading
      mobileImage={
        <SettingsAppImage
          appName={config.name}
          imagePath={config.imagePath}
          variant="detail"
        />
      }
      title={
        <h1 className="break-words text-xl font-bold sm:text-2xl">{appName}</h1>
      }
      metadata={
        <>
          <Badge variant={config.active === 1 ? "outline" : "secondary"}>
            {config.active === 1 ? "Ativa" : "Inativa"}
          </Badge>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Configuração ID {config.id}</span>
          <span aria-hidden="true">·</span>
          <span>{domain}</span>
        </>
      }
    />
  );
}
