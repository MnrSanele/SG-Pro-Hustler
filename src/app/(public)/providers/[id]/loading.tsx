import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-36" />
      </div>
      <Skeleton className="h-80 w-full rounded-lg" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </main>
  );
}
