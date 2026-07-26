"use client";

import type { ReactNode } from "react";
import { DownloadIcon, XIcon } from "lucide-react";

import { LoadableImage } from "@/components/loadable-image";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getImageContentUrl,
  getImageDownloadUrl,
} from "@/lib/api/images.client";
import { cn } from "@/lib/utils";

export type ViewerImage = {
  id: string;
  userFilename: string;
};

type ImageViewerTriggerProps = {
  userFilename: string;
  onOpen: () => void;
  children?: ReactNode;
  className?: string;
};

export function ImageViewerTrigger({
  userFilename,
  onOpen,
  children,
  className,
}: ImageViewerTriggerProps) {
  return (
    <button
      type="button"
      aria-label={`View ${userFilename}`}
      onClick={onOpen}
      className={cn(
        "cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
        className,
      )}
    >
      {children}
    </button>
  );
}

type ImageViewerProps = {
  image: ViewerImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageViewer({ image, open, onOpenChange }: ImageViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && image ? (
        <DialogContent
          showCloseButton={false}
          className="flex h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(90dvh,56rem)] sm:max-w-6xl"
        >
          <DialogHeader className="flex-row items-center gap-4 border-b px-5 py-4">
            <div className="min-w-0 flex-1">
              <DialogTitle
                className="truncate leading-snug"
                title={image.userFilename}
              >
                {image.userFilename}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full-size preview of {image.userFilename}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={getImageDownloadUrl(image.id)}
                download={image.userFilename}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <DownloadIcon data-icon="inline-start" />
                Download
              </a>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close preview"
                  />
                }
              >
                <XIcon />
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="relative min-h-0 flex-1 bg-muted/40">
            <LoadableImage
              src={getImageContentUrl(image.id)}
              alt={image.userFilename}
              fill
              sizes="(max-width: 640px) calc(100vw - 2rem), 72rem"
              unoptimized
              className="object-contain p-4 sm:p-8"
              skeletonClassName="inset-4 rounded-xl sm:inset-8"
              showErrorMessage
              errorMessage="Full-size preview unavailable"
            />
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
