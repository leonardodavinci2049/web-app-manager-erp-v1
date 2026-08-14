"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { SellerActionResult } from "../types/seller-detail-types";

export function useSellerSectionAction() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const clearError = (field: string) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const runAction = async (action: Promise<SellerActionResult>) => {
    setSaving(true);
    setErrors({});
    try {
      const result = await action;
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a comunicação com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  return { clearError, errors, runAction, saving };
}
