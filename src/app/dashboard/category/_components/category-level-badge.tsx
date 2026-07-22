import { Badge } from "@/components/ui/badge";
import { LEVEL_BADGES } from "./category-constants";

export function LevelBadge({ level }: { level: 1 | 2 | 3 }) {
  return (
    <Badge
      variant={level === 1 ? "default" : level === 2 ? "secondary" : "outline"}
      className="h-5 rounded-sm px-1.5 text-[10px] tracking-wide"
    >
      {LEVEL_BADGES[level]}
    </Badge>
  );
}
