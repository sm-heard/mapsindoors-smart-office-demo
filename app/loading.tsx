import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-1/2 w-1/2 rounded-lg" />
    </div>
  );
}
