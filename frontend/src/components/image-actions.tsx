"use client";

import { useAuth } from "@clerk/nextjs";
import { type FormEvent, useEffect, useState } from "react";
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

export type ActionImage = {
  id: string;
  userFilename: string;
};

type ImageActionsMenuProps = {
  image: ActionImage;
  onRename: () => void;
  onDelete: () => void;
};

export function ImageActionsMenu({
  image,
  onRename,
  onDelete,
}: ImageActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${image.userFilename}`}
          />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={onRename}>
          <PencilIcon />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <a
              href={getImageDownloadUrl(image.id)}
              download={image.userFilename}
            />
          }
        >
          <DownloadIcon />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type ImageRenameDialogProps = {
  image: ActionImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageRenameDialog({
  image,
  open,
  onOpenChange,
}: ImageRenameDialogProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [filename, setFilename] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && image) {
      setFilename(image.userFilename);
      setError(null);
    }
  }, [open, image]);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) return;

    const nextFilename = filename.trim();
    if (!nextFilename) {
      setError("Enter a filename.");
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      await renameImage(image.id, nextFilename, getToken);
      onOpenChange(false);
      toast.success("Image renamed", {
        description: `“${image.userFilename}” was renamed to “${nextFilename}”.`,
      });
      router.refresh();
    } catch {
      setError("The image could not be renamed. Try again.");
    } finally {
      setIsRenaming(false);
    }
  }

  const canRename =
    Boolean(image) &&
    filename.trim().length > 0 &&
    filename.trim() !== image?.userFilename;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && image ? (
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
                <Label htmlFor="shared-rename-filename">New filename</Label>
                <Input
                  id="shared-rename-filename"
                  name="filename"
                  value={filename}
                  onChange={(event) => setFilename(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? "shared-rename-filename-error" : undefined
                  }
                  autoComplete="off"
                  autoFocus
                  disabled={isRenaming}
                />
                {error && (
                  <p
                    id="shared-rename-filename-error"
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
      ) : null}
    </Dialog>
  );
}

type ImageDeleteDialogProps = {
  image: ActionImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageDeleteDialog({
  image,
  open,
  onOpenChange,
}: ImageDeleteDialogProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setDeleteError(null);
  }, [open]);

  async function handleDelete() {
    if (!image) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteImage(image.id, getToken);
      onOpenChange(false);
      toast.success("Image deleted", {
        description: `${image.userFilename} was removed from your library.`,
      });
      router.refresh();
    } catch {
      setDeleteError("The image could not be deleted. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {open && image ? (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                “{image.userFilename}”
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
      ) : null}
    </AlertDialog>
  );
}
