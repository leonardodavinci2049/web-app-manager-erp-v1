"use client";

import { useState } from "react";
import type { UISupplier } from "@/services/api-main/supplier";
import {
  resolveSupplierPersonTypeId,
  type SupplierPersonTypeId,
} from "../supplier-detail-utils";
import { SupplierBusinessSection } from "./supplier-business-section";
import { SupplierPersonTypeSection } from "./supplier-person-type-section";
import { SupplierPersonalSection } from "./supplier-personal-section";

interface SupplierPersonOverviewProps {
  supplier: UISupplier;
}

export function SupplierPersonOverview({
  supplier,
}: SupplierPersonOverviewProps) {
  const currentPersonTypeId = resolveSupplierPersonTypeId(supplier);
  const [selectedPersonTypeId, setSelectedPersonTypeId] = useState<
    SupplierPersonTypeId | undefined
  >(() => currentPersonTypeId);

  return (
    <>
      <SupplierPersonTypeSection
        currentPersonTypeId={currentPersonTypeId}
        selectedPersonTypeId={selectedPersonTypeId}
        onSelect={setSelectedPersonTypeId}
      />
      {selectedPersonTypeId === 1 && (
        <SupplierPersonalSection supplier={supplier} />
      )}
      {selectedPersonTypeId === 2 && (
        <SupplierBusinessSection supplier={supplier} />
      )}
    </>
  );
}
