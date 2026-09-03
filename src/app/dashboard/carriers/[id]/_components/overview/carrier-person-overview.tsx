"use client";

import { useState } from "react";
import type { UICarrier } from "@/services/api-main/carrier";
import {
  type CarrierPersonTypeId,
  resolveCarrierPersonTypeId,
} from "../carrier-detail-utils";
import { CarrierBusinessSection } from "./carrier-business-section";
import { CarrierPersonTypeSection } from "./carrier-person-type-section";
import { CarrierPersonalSection } from "./carrier-personal-section";

interface CarrierPersonOverviewProps {
  carrier: UICarrier;
}

export function CarrierPersonOverview({ carrier }: CarrierPersonOverviewProps) {
  const currentPersonTypeId = resolveCarrierPersonTypeId(carrier);
  const [selectedPersonTypeId, setSelectedPersonTypeId] = useState<
    CarrierPersonTypeId | undefined
  >(() => currentPersonTypeId);

  return (
    <>
      <CarrierPersonTypeSection
        currentPersonTypeId={currentPersonTypeId}
        selectedPersonTypeId={selectedPersonTypeId}
        onSelect={setSelectedPersonTypeId}
      />
      {selectedPersonTypeId === 1 && (
        <CarrierPersonalSection carrier={carrier} />
      )}
      {selectedPersonTypeId === 2 && (
        <CarrierBusinessSection carrier={carrier} />
      )}
    </>
  );
}
