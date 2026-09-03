"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandDetailForm } from "../brand-detail-form";

interface BrandDetailFormSectionProps {
  brand: UIBrand;
}

export function BrandDetailFormSection({ brand }: BrandDetailFormSectionProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do cadastro</CardTitle>
      </CardHeader>
      <CardContent>
        <BrandDetailForm brand={brand} onSaved={() => router.refresh()} />
      </CardContent>
    </Card>
  );
}
