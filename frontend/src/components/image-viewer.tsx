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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getImageContentUrl,
  getImageDownloadUrl,
} from "@/lib/api/images.client";
import { cn } from "@/lib/utils";

type ImageViewerProps = {
  imageId: string;
  userFilename: string;
  children?: ReactNode;
  triggerClassName?: string;
};

export function ImageViewer({
  imageId,
  userFilename,
  children,
  triggerClassName,
}: ImageViewerProps) {
  const contentUrl = getImageContentUrl(imageId);

  return (
    <Dialog>
      <DialogTrigger
        type="button"
        aria-label={`View ${userFilename}`}
        className={cn(
          "cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
          triggerClassName,
        )}
      >
        {children}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(90dvh,56rem)] sm:max-w-6xl"
      >
        <DialogHeader className="flex-row items-center gap-4 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate leading-snug" title={userFilename}>
              {userFilename}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-size preview of {userFilename}
            </DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={getImageDownloadUrl(imageId)}
              download={userFilename}
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
            src={contentUrl}
            alt={userFilename}
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
    </Dialog>
  );
}
