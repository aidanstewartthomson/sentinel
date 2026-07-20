"use client";

import { useEffect } from "react";
import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col p-4 md:p-6 lg:px-8 lg:py-8">
        <Empty className="min-h-96 border bg-card">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-destructive/10 text-destructive"
            >
              <CircleAlertIcon />
            </EmptyMedia>
            <EmptyTitle>
              <h1>Couldn&apos;t load the library</h1>
            </EmptyTitle>
            <EmptyDescription>
              Sentinel couldn&apos;t reach the image service. Check the
              connection and try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" size="sm" onClick={unstable_retry}>
              <RefreshCwIcon data-icon="inline-start" />
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
