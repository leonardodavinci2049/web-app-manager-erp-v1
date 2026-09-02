import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EntryTabCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function EntryTabCard({ icon, title, children }: EntryTabCardProps) {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}

interface EntryTabFieldProps {
  label: string;
  value?: string | number;
}

export function EntryTabField({ label, value }: EntryTabFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}
