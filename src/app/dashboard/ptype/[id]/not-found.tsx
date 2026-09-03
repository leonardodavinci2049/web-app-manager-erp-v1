import { Shapes } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PtypeNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <Shapes className="text-muted-foreground mb-4 size-14" />
      <h1 className="text-xl font-semibold">Tipo de produto não encontrado</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        O cadastro não existe ou não está acessível para a organização atual.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/dashboard/ptype">Voltar aos tipos de produtos</Link>
      </Button>
    </div>
  );
}
