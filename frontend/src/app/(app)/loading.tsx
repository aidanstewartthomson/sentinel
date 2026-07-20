import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col">
      <div
        className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:px-8 lg:py-8"
        aria-busy="true"
        aria-label="Loading image library"
        role="status"
      >
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-28 rounded-lg" />
          </div>
          <div className="overflow-hidden rounded-lg border bg-background">
            <div className="flex h-11 items-center border-b bg-muted/30 px-4">
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="flex h-[61px] items-center gap-3 px-4"
                >
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-full max-w-56" />
                    <Skeleton className="h-3 w-full max-w-36 sm:hidden" />
                  </div>
                  <Skeleton className="hidden h-4 w-20 md:block" />
                  <Skeleton className="hidden h-4 w-14 sm:block" />
                  <Skeleton className="size-7 shrink-0 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
