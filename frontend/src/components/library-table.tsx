"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowUpDownIcon,
  DownloadIcon,
  Grid2X2Icon,
  ListIcon,
  LoaderCircleIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  ImageActionsMenu,
  ImageDeleteDialog,
  ImageRenameDialog,
  type ActionImage,
} from "@/components/image-actions";
import {
  ImageViewer,
  ImageViewerTrigger,
  type ViewerImage,
} from "@/components/image-viewer";
import { LoadableImage } from "@/components/loadable-image";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  deleteImage,
  getImageDownloadUrl,
  getImageThumbnailUrl,
} from "@/lib/api/images.client";
import type { ImageMetadata } from "@/lib/types/image";
import {
  formatDate,
  formatFileSize,
  formatFileType,
} from "@/lib/utils";

type LibraryTableProps = {
  images: ImageMetadata[];
};

type LibraryView = "grid" | "list";

/** Three rows at xl:grid-cols-5 — above-the-fold thumbs load eagerly. */
const ABOVE_FOLD_THUMBNAILS = 15;

type SortOrder = "newest" | "oldest" | "name" | "largest" | "smallest";

const SORT_LABELS: Record<SortOrder, string> = {
  newest: "Newest",
  oldest: "Oldest",
  name: "Name",
  largest: "Largest",
  smallest: "Smallest",
};

type ImageCollectionProps = {
  images: ImageMetadata[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onViewImage: (image: ViewerImage) => void;
  onRenameImage: (image: ActionImage) => void;
  onDeleteImage: (image: ActionImage) => void;
};

function toActionImage(image: ImageMetadata): ActionImage {
  return { id: image.id, userFilename: image.user_filename };
}

function toViewerImage(image: ImageMetadata): ViewerImage {
  return { id: image.id, userFilename: image.user_filename };
}

function ImageGrid({
  images,
  selectedIds,
  onSelect,
  onViewImage,
  onRenameImage,
  onDeleteImage,
}: ImageCollectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {images.map((image, index) => {
        const isSelected = selectedIds.has(image.id);
        const actionImage = toActionImage(image);

        return (
          <Card
            key={image.id}
            size="sm"
            data-state={isSelected ? "selected" : undefined}
            className="gap-0 pt-0 pb-0 [content-visibility:auto] [contain-intrinsic-size:auto_280px] data-[state=selected]:ring-2 data-[state=selected]:ring-ring"
          >
            <CardContent className="relative aspect-square px-0">
              <ImageViewerTrigger
                userFilename={image.user_filename}
                onOpen={() => onViewImage(toViewerImage(image))}
                className="relative block size-full overflow-hidden bg-muted"
              >
                <LoadableImage
                  src={getImageThumbnailUrl(image.id)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  priority={index < ABOVE_FOLD_THUMBNAILS}
                  loading={index < ABOVE_FOLD_THUMBNAILS ? "eager" : "lazy"}
                  unoptimized
                  className="object-cover"
                />
              </ImageViewerTrigger>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5">
                <div className="pointer-events-auto rounded-md bg-background/90 p-1 shadow-sm">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(image.id, checked)}
                    aria-label={`Select ${image.user_filename}`}
                  />
                </div>
                <div className="pointer-events-auto rounded-md bg-background/90 shadow-sm">
                  <ImageActionsMenu
                    image={actionImage}
                    onRename={() => onRenameImage(actionImage)}
                    onDelete={() => onDeleteImage(actionImage)}
                  />
                </div>
              </div>
            </CardContent>
            <CardHeader className="min-w-0 gap-1 px-4 py-3">
              <CardTitle
                className="truncate leading-snug"
                title={image.user_filename}
              >
                {image.user_filename}
              </CardTitle>
              <CardDescription className="truncate text-xs">
                {formatFileType(image.user_filename)}
                <span aria-hidden="true"> · </span>
                {formatFileSize(image.size_bytes)}
                <span aria-hidden="true"> · </span>
                <time dateTime={image.created_at}>
                  {formatDate(image.created_at)}
                </time>
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

type ImageListProps = ImageCollectionProps & {
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
};

function ImageList({
  images,
  selectedIds,
  allSelected,
  someSelected,
  onSelect,
  onSelectAll,
  onViewImage,
  onRenameImage,
  onDeleteImage,
}: ImageListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table className="table-fixed">
        <TableCaption className="sr-only">
          Images in your library
        </TableCaption>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="h-11 w-10 pr-0 pl-4">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all visible images"
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
          {images.map((image, index) => {
            const isSelected = selectedIds.has(image.id);
            const actionImage = toActionImage(image);

            return (
              <TableRow
                key={image.id}
                data-state={isSelected ? "selected" : undefined}
                className="[content-visibility:auto] [contain-intrinsic-size:auto_3.5rem]"
              >
                <TableCell className="w-10 py-2.5 pr-0 pl-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onSelect(image.id, checked)
                    }
                    aria-label={`Select ${image.user_filename}`}
                  />
                </TableCell>
                <TableCell className="min-w-0 py-2.5 pr-3 pl-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ImageViewerTrigger
                      userFilename={image.user_filename}
                      onOpen={() => onViewImage(toViewerImage(image))}
                      className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                    >
                      <LoadableImage
                        src={getImageThumbnailUrl(image.id)}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        priority={index === 0}
                        loading={index < ABOVE_FOLD_THUMBNAILS ? "eager" : "lazy"}
                        unoptimized
                        className="size-full object-cover"
                      />
                    </ImageViewerTrigger>
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
                  <ImageActionsMenu
                    image={actionImage}
                    onRename={() => onRenameImage(actionImage)}
                    onDelete={() => onDeleteImage(actionImage)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function LibraryTable({ images }: LibraryTableProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [storedSelectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [view, setView] = useState<LibraryView>("grid");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<ViewerImage | null>(null);
  const [renameImage, setRenameImage] = useState<ActionImage | null>(null);
  const [deleteImageTarget, setDeleteImageTarget] =
    useState<ActionImage | null>(null);

  const selectedIds = useMemo(() => {
    const validIds = new Set(images.map((image) => image.id));
    return new Set([...storedSelectedIds].filter((id) => validIds.has(id)));
  }, [images, storedSelectedIds]);

  const visibleImages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = normalizedQuery
      ? images.filter((image) =>
          image.user_filename.toLocaleLowerCase().includes(normalizedQuery),
        )
      : images;

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return Date.parse(a.created_at) - Date.parse(b.created_at);
        case "name":
          return a.user_filename.localeCompare(b.user_filename, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        case "largest":
          return b.size_bytes - a.size_bytes;
        case "smallest":
          return a.size_bytes - b.size_bytes;
        case "newest":
        default:
          return Date.parse(b.created_at) - Date.parse(a.created_at);
      }
    });
  }, [images, query, sortOrder]);

  const allSelected =
    visibleImages.length > 0 &&
    visibleImages.every((image) => selectedIds.has(image.id));
  const someSelected =
    !allSelected && visibleImages.some((image) => selectedIds.has(image.id));
  const imageCountLabel = query.trim()
    ? `${visibleImages.length} of ${images.length} ${
        images.length === 1 ? "image" : "images"
      }`
    : `${images.length} ${images.length === 1 ? "image" : "images"}`;

  function toggleAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      for (const image of visibleImages) {
        if (checked) next.add(image.id);
        else next.delete(image.id);
      }

      return next;
    });
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
      const failedIds = ids.filter(
        (_, index) => results[index].status === "rejected",
      );

      if (succeeded > 0) {
        toast.success(
          succeeded === 1
            ? "Image deleted"
            : `${succeeded} images deleted`,
        );
        router.refresh();
      }

      if (failedIds.length > 0) {
        setSelectedIds(new Set(failedIds));
        setDeleteError(
          failedIds.length === 1
            ? "One image could not be deleted. Try again."
            : `${failedIds.length} images could not be deleted. Try again.`,
        );
      } else {
        clearSelection();
        setIsDeleteOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {view === "grid" && visibleImages.length > 0 && (
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all visible images"
              />
            )}
            <h2
              id="library-heading"
              className="text-sm font-medium text-muted-foreground"
              aria-live="polite"
            >
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : imageCountLabel}
            </h2>
          </div>

          {selectedIds.size > 0 ? (
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
          ) : (
            <UploadButton />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="sm:max-w-sm">
            <InputGroupInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by filename…"
              aria-label="Search images by filename"
              className="[&::-webkit-search-cancel-button]:hidden"
            />
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="outline" size="sm" />
                }
              >
                <ArrowUpDownIcon data-icon="inline-start" />
                {SORT_LABELS[sortOrder]}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortOrder}
                    onValueChange={(value) =>
                      setSortOrder(value as SortOrder)
                    }
                  >
                    {Object.entries(SORT_LABELS).map(([value, label]) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <ToggleGroup
              value={[view]}
              onValueChange={(values) => {
                const nextView = values[0];
                if (nextView === "grid" || nextView === "list") {
                  setView(nextView);
                }
              }}
              variant="outline"
              size="sm"
              spacing={0}
              aria-label="Library view"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                title="Grid view"
              >
                <Grid2X2Icon />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                title="List view"
              >
                <ListIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {visibleImages.length === 0 ? (
        <Empty className="min-h-72 border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>No matching images</EmptyTitle>
            <EmptyDescription>
              Try a different filename or clear your search.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      ) : view === "grid" ? (
        <ImageGrid
          images={visibleImages}
          selectedIds={selectedIds}
          onSelect={toggleOne}
          onViewImage={setViewerImage}
          onRenameImage={setRenameImage}
          onDeleteImage={setDeleteImageTarget}
        />
      ) : (
        <ImageList
          images={visibleImages}
          selectedIds={selectedIds}
          allSelected={allSelected}
          someSelected={someSelected}
          onSelect={toggleOne}
          onSelectAll={toggleAll}
          onViewImage={setViewerImage}
          onRenameImage={setRenameImage}
          onDeleteImage={setDeleteImageTarget}
        />
      )}

      <ImageViewer
        image={viewerImage}
        open={viewerImage !== null}
        onOpenChange={(open) => {
          if (!open) setViewerImage(null);
        }}
      />
      <ImageRenameDialog
        image={renameImage}
        open={renameImage !== null}
        onOpenChange={(open) => {
          if (!open) setRenameImage(null);
        }}
      />
      <ImageDeleteDialog
        image={deleteImageTarget}
        open={deleteImageTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteImageTarget(null);
        }}
      />

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
