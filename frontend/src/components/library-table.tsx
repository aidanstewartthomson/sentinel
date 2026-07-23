"use client";

import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DownloadIcon,
  LoaderCircleIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ImageActions } from "@/components/image-actions";
import { UploadButton } from "@/components/upload-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  deleteImage,
  getImageDownloadUrl,
} from "@/lib/api/images.client";
import type { ImageMetadata } from "@/lib/types/image";
import { formatDate, formatFileSize } from "@/lib/utils";

type LibraryTableProps = {
  images: ImageMetadata[];
};

export function LibraryTable({ images }: LibraryTableProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const validIds = new Set(images.map((image) => image.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [images]);

  const allSelected =
    images.length > 0 && selectedIds.size === images.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(images.map((image) => image.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleBulkDownload() {
    const selected = images.filter((image) => selectedIds.has(image.id));

    for (const image of selected) {
      const link = document.createElement("a");
      link.href = getImageDownloadUrl(image.id);
      link.download = image.user_filename;
      link.click();
    }

    toast.success(
      selected.length === 1
        ? "Download started"
        : `${selected.length} downloads started`,
    );
  }

  function handleDeleteOpenChange(open: boolean) {
    if (open) setDeleteError(null);
    setIsDeleteOpen(open);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => deleteImage(id, getToken)),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        toast.success(
          succeeded === 1
            ? "Image deleted"
            : `${succeeded} images deleted`,
        );
        clearSelection();
        setIsDeleteOpen(false);
        router.refresh();
      }

      if (failed > 0) {
        setDeleteError(
          failed === 1
            ? "One image could not be deleted. Please try again."
            : `${failed} images could not be deleted. Please try again.`,
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex min-h-8 items-center justify-between gap-4">
        {selectedIds.size > 0 ? (
          <>
            <h2
              id="library-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              {selectedIds.size} selected
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
              >
                <DownloadIcon data-icon="inline-start" />
                Download
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clearSelection}
                aria-label="Clear selection"
              >
                <XIcon />
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2
              id="library-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              {images.length} {images.length === 1 ? "image" : "images"}
            </h2>
            <UploadButton />
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table className="table-fixed">
          <TableCaption className="sr-only">
            Images in your Sentinel library
          </TableCaption>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="h-11 w-10 pr-0 pl-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all images"
                />
              </TableHead>
              <TableHead className="h-11 pr-3 pl-3">Name</TableHead>
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
            {images.map((image) => {
              const isSelected = selectedIds.has(image.id);

              return (
                <TableRow
                  key={image.id}
                  data-state={isSelected ? "selected" : undefined}
                >
                  <TableCell className="w-10 py-2.5 pr-0 pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        toggleOne(image.id, checked)
                      }
                      aria-label={`Select ${image.user_filename}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-0 py-2.5 pr-3 pl-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                        <Image
                          src={`/api/images/${image.id}/content`}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
                          unoptimized
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size === 1 ? "this image" : "these images"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size === 1
                ? "This image will be permanently removed from your library. This can\u2019t be undone."
                : `${selectedIds.size} images will be permanently removed from your library. This can\u2019t be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting && (
                <LoaderCircleIcon
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              {isDeleting
                ? "Deleting…"
                : selectedIds.size === 1
                  ? "Delete image"
                  : `Delete ${selectedIds.size} images`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
