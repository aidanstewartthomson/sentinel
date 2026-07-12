import Image from "next/image";

import { AppSidebar } from "@/components/app-sidebar";
import { UploadButton } from "@/components/upload-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DownloadIcon,
  EllipsisIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { listImages } from "@/lib/api/images.server";
import { formatDate, formatFileSize } from "@/lib/utils";

export default async function Home() {
  const images = await listImages();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="flex h-14 min-w-0 shrink-0 items-center border-b bg-background">
          <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <span className="truncate text-sm font-medium">Library</span>
            </div>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col bg-muted/20">
          <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse and manage images available to Sentinel.
              </p>
            </div>

            <section className="min-w-0" aria-labelledby="library-heading">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2
                  id="library-heading"
                  className="truncate text-sm font-medium"
                >
                  {images.length} images
                </h2>
                <UploadButton />
              </div>

              <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-xs">
                <Table className="table-fixed">
                  <TableCaption className="sr-only">
                    Images available to Sentinel
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-11 pr-3 pl-4">Name</TableHead>
                      <TableHead className="hidden h-11 w-28 px-3 md:table-cell">
                        Added
                      </TableHead>
                      <TableHead className="h-11 w-24 px-3">Size</TableHead>
                      <TableHead className="h-11 w-14 pr-4">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {images.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell className="min-w-0 py-3 pr-3 pl-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative size-9 shrink-0 overflow-hidden rounded-md border bg-muted">
                              <Image
                                src={`/api/images/${image.id}/content`}
                                alt={image.caption || image.original_filename}
                                width={36}
                                height={36}
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="truncate font-medium"
                                title={image.original_filename}
                              >
                                {image.original_filename}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden w-28 px-3 py-3 text-muted-foreground md:table-cell">
                          {formatDate(image.created_at)}
                        </TableCell>
                        <TableCell className="w-24 px-3 py-3 text-muted-foreground">
                          {formatFileSize(image.size_bytes)}
                        </TableCell>
                        <TableCell className="w-14 py-3 pr-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Actions for ${image.original_filename}`}
                                />
                              }
                            >
                              <EllipsisIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem>
                                <PencilIcon />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DownloadIcon />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">
                                <Trash2Icon />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
