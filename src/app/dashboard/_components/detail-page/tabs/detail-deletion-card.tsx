import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailDeletionCardProps {
  titleIcon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

/**
 * Visual danger-zone frame shared by registration detail deletion tabs.
 * Confirmation flows, actions, and messages stay in each route's tab.
 */
export function DetailDeletionCard({
  titleIcon,
  badge,
  children,
}: DetailDeletionCardProps) {
  return (
    <Card className="gap-4 border-destructive/40 bg-destructive/5 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
        <CardTitle className="text-destructive flex items-center gap-2 text-base">
          {titleIcon}
          Zona de exclusão
        </CardTitle>
        {badge}
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}
