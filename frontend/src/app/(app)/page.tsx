import { ImageIcon } from "lucide-react";

import { LibraryTable } from "@/components/library-table";
import { UploadButton } from "@/components/upload-button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listImages } from "@/lib/api/images.server";

export default async function Home() {
  const images = await listImages();

  return (
    <div className="@container/main flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Your library
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage the images Sentinel can search and analyse.
          </p>
        </div>

        <section className="min-w-0" aria-labelledby="library-heading">
          {images.length === 0 ? (
            <Empty className="min-h-96 border bg-card">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>
                  <h2 id="library-heading">No images yet</h2>
                </EmptyTitle>
                <EmptyDescription>
                  Upload an image to make it searchable in Sentinel.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <UploadButton />
              </EmptyContent>
            </Empty>
          ) : (
            <LibraryTable images={images} />
          )}
        </section>
      </div>
    </div>
  );
}
