import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DetailBackLinkProps {
  href: string;
  label: string;
}

export function DetailBackLink({ href, label }: DetailBackLinkProps) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm lg:col-span-2 lg:justify-self-start"
    >
      <Link href={href}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
