"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DownloadIcon,
  EllipsisIcon,
  LoaderCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteImage,
  getImageDownloadUrl,
  renameImage,
} from "@/lib/api/images.client";

type ImageActionsProps = {
  imageId: string;
  userFilename: string;
};

export function ImageActions({
  imageId,
  userFilename,
}: ImageActionsProps) {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [filename, setFilename] = useState(userFilename);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleOpenChange(open: boolean) {
    if (open) {
      setFilename(userFilename);
      setError(null);
    }

    setIsRenameOpen(open);
  }

  function handleDeleteOpenChange(open: boolean) {
    if (open) {
      setDeleteError(null);
    }

    setIsDeleteOpen(open);
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFilename = filename.trim();
    if (!nextFilename) {
      setError("Enter a filename.");
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      await renameImage(imageId, nextFilename);
      setIsRenameOpen(false);
      router.refresh();
    } catch {
      setError("The image could not be renamed. Please try again.");
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteImage(imageId);
      setIsDeleteOpen(false);
      router.refresh();
    } catch {
      setDeleteError("The image could not be deleted. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const canRename =
    filename.trim().length > 0 && filename.trim() !== userFilename;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${userFilename}`}
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <a
                href={getImageDownloadUrl(imageId)}
                download={userFilename}
              />
            }
          >
            <DownloadIcon />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleRename} className="contents">
            <DialogHeader>
              <DialogTitle>Rename image</DialogTitle>
              <DialogDescription>
                Update how this image appears in your library.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor={`filename-${imageId}`}>Filename</Label>
                <Input
                  id={`filename-${imageId}`}
                  name="filename"
                  value={filename}
                  onChange={(event) => setFilename(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? `filename-error-${imageId}` : undefined
                  }
                  autoComplete="off"
                  autoFocus
                  disabled={isRenaming}
                />
                {error && (
                  <p
                    id={`filename-error-${imageId}`}
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose
                render={<Button type="button" variant="outline" />}
                disabled={isRenaming}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={!canRename || isRenaming}>
                {isRenaming && (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                {isRenaming ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete image?</DialogTitle>
            <DialogDescription>
              This will permanently delete {userFilename}. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}

          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={isDeleting}
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && (
                <LoaderCircleIcon
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
