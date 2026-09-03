import type { ReactNode } from "react";
import { TabsTrigger } from "@/components/ui/tabs";

const DETAIL_TAB_TRIGGER_CLASS_NAME =
  "h-8 min-w-max flex-none snap-start px-3 text-xs sm:h-9 sm:text-sm lg:min-w-0 lg:px-2";

interface DetailTabTriggerProps {
  value: string;
  children: ReactNode;
}

export function DetailTabTrigger({ value, children }: DetailTabTriggerProps) {
  return (
    <TabsTrigger value={value} className={DETAIL_TAB_TRIGGER_CLASS_NAME}>
      {children}
    </TabsTrigger>
  );
}
