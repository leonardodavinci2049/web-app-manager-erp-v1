"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/**
 * Ilha client responsavel por paginacao heuristica via searchParam `limit`.
 * Le o estado atual da URL e incrementa o limite preservando os demais params.
 */
export function LoadMoreButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentLimit = Number(params.get("limit")) || 50;
    params.set("limit", String(currentLimit + 50));
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={isPending}
      className="min-w-[200px]"
    >
      {isPending ? "Carregando..." : "Carregar mais produtos"}
    </Button>
  );
}
