"use client";

import type { ReactNode } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getImageContentUrl } from "@/lib/api/images.client";
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
      <DialogContent className="flex h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(90dvh,56rem)] sm:max-w-6xl">
        <DialogHeader className="min-w-0 shrink-0 px-4 py-3 pr-12">
          <DialogTitle className="truncate" title={userFilename}>
            {userFilename}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full-size preview of {userFilename}
          </DialogDescription>
        </DialogHeader>
        <div className="relative min-h-0 flex-1 bg-muted/30">
          <Image
            src={contentUrl}
            alt={userFilename}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), 72rem"
            unoptimized
            className="object-contain p-2 sm:p-4"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
