import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Skeleton className="h-[600px] w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <Skeleton className="h-[420px] w-full rounded-lg" />
    </div>
  );
}
