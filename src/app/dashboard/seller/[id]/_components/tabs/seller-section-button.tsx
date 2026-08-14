import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SellerSectionButtonProps {
  label: string;
  saving: boolean;
}

export function SellerSectionButton({
  label,
  saving,
}: SellerSectionButtonProps) {
  return (
    <Button type="submit" disabled={saving}>
      {saving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {saving ? "Salvando..." : label}
    </Button>
  );
}
