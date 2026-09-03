import { ExternalLink, Truck } from "lucide-react";
import Link from "next/link";
import type { UIEntryDetail } from "@/services/api-main/entry/transformers/transformers";
import { EntryDetailField } from "../entry-detail-field";
import { EntrySectionCard } from "../entry-section-card";

interface EntryPartnersSectionProps {
  entry: Pick<UIEntryDetail, "supplierId" | "supplier" | "carrier">;
}

export function EntryPartnersSection({ entry }: EntryPartnersSectionProps) {
  return (
    <EntrySectionCard
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
        <EntryDetailField label="Transportadora" value={entry.carrier} />
      </dl>
    </EntrySectionCard>
  );
}
