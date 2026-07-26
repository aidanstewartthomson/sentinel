"use client";

import { useAuth } from "@clerk/nextjs";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DownloadIcon,
  EllipsisIcon,
  LoaderCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

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
  const { getToken } = useAuth();
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
      await renameImage(imageId, nextFilename, getToken);
      setIsRenameOpen(false);
      toast.success("Image renamed", {
        description: `“${userFilename}” was renamed to “${nextFilename}”.`,
      });
      router.refresh();
    } catch {
      setError("The image could not be renamed. Try again.");
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteImage(imageId, getToken);
      setIsDeleteOpen(false);
      toast.success("Image deleted", {
        description: `${userFilename} was removed from your library.`,
      });
      router.refresh();
    } catch {
      setDeleteError("The image could not be deleted. Try again.");
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
                Enter a new filename for this image.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor={`filename-${imageId}`}>New filename</Label>
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
                {isRenaming ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                “{userFilename}”
              </span>{" "}
              will be permanently removed from your library. This can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
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
              {isDeleting ? "Deleting…" : "Delete image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
