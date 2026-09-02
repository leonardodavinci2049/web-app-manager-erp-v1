import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EntryNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <PackageSearch className="text-muted-foreground mb-4 size-14" />
      <h1 className="text-xl font-semibold">Entrada não encontrada</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        O registro não existe ou não está acessível para a organização atual.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/dashboard/entry">Voltar às entradas</Link>
      </Button>
    </div>
  );
}
