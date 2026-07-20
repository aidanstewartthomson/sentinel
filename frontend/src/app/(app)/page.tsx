import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { ImageActions } from "@/components/image-actions";
import { UploadButton } from "@/components/upload-button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listImages } from "@/lib/api/images.server";
import { formatDate, formatFileSize } from "@/lib/utils";

export default async function Home() {
  const images = await listImages();

  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col">
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
            <>
              <div className="mb-3 flex items-end justify-between gap-4">
                <h2
                  id="library-heading"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {images.length} {images.length === 1 ? "image" : "images"}
                </h2>
                <UploadButton />
              </div>
              <div className="overflow-hidden rounded-lg border bg-background">
                <Table className="table-fixed">
                  <TableCaption className="sr-only">
                    Images in your Sentinel library
                  </TableCaption>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="h-11 pr-3 pl-4">Name</TableHead>
                      <TableHead className="hidden h-11 w-32 px-3 md:table-cell">
                        Uploaded
                      </TableHead>
                      <TableHead className="hidden h-11 w-24 px-3 sm:table-cell">
                        File size
                      </TableHead>
                      <TableHead className="h-11 w-14 pr-4">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {images.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell className="min-w-0 py-2.5 pr-3 pl-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                              <Image
                                src={`/api/images/${image.id}/content`}
                                alt={image.caption || ""}
                                width={40}
                                height={40}
                                sizes="40px"
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="truncate font-medium"
                                title={image.user_filename}
                              >
                                {image.user_filename}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">
                                {formatFileSize(image.size_bytes)}
                                <span aria-hidden="true"> · </span>
                                <time dateTime={image.created_at}>
                                  {formatDate(image.created_at)}
                                </time>
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden w-32 px-3 py-2.5 text-muted-foreground md:table-cell">
                          <time dateTime={image.created_at}>
                            {formatDate(image.created_at)}
                          </time>
                        </TableCell>
                        <TableCell className="hidden w-24 px-3 py-2.5 text-muted-foreground sm:table-cell">
                          {formatFileSize(image.size_bytes)}
                        </TableCell>
                        <TableCell className="w-14 py-2.5 pr-4 text-right">
                          <ImageActions
                            imageId={image.id}
                            userFilename={image.user_filename}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
