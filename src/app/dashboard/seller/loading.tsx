import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_IDS = [
  "seller-1",
  "seller-2",
  "seller-3",
  "seller-4",
  "seller-5",
  "seller-6",
];

export default function SellerLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-3 py-6 lg:px-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SKELETON_IDS.map((id) => (
          <Skeleton key={id} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
