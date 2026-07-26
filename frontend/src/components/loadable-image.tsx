"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageOffIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadableImageProps = Omit<ImageProps, "onError" | "onLoad"> & {
  errorClassName?: string;
  errorMessage?: string;
  showErrorMessage?: boolean;
  skeletonClassName?: string;
};

export function LoadableImage({
  alt,
  className,
  errorClassName,
  errorMessage = "Image preview unavailable",
  showErrorMessage = false,
  skeletonClassName,
  ...props
}: LoadableImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  return (
    <>
      {status === "loading" && (
        <Skeleton
          className={cn("absolute inset-0 rounded-none", skeletonClassName)}
          aria-hidden="true"
        />
      )}
      {status === "error" ? (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
            errorClassName,
          )}
          role={showErrorMessage ? "status" : undefined}
          aria-hidden={showErrorMessage ? undefined : true}
        >
          <ImageOffIcon />
          {showErrorMessage && (
            <span className="text-sm font-medium">{errorMessage}</span>
          )}
        </div>
      ) : (
        <Image
          {...props}
          alt={alt}
          className={cn(
            status === "loaded" ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
}
