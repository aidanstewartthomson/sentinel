"use client";

import { useAuth } from "@clerk/nextjs";
import { type ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/api/images.client";

export function UploadButton() {
  const router = useRouter();
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const results = await Promise.allSettled(
        files.map((file) => uploadImage(file, getToken)),
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        toast.success(
          succeeded === 1 ? "Image uploaded" : `${succeeded} images uploaded`,
          {
            description:
              files.length === 1
                ? `${files[0].name} is now available in your library.`
                : "They are now available in your library.",
          },
        );
        router.refresh();
      }

      if (failed > 0) {
        toast.error(
          failed === 1 ? "Upload failed" : `${failed} uploads failed`,
          {
            description: "Try again.",
          },
        );
      }
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  }

  return (
    <div className="shrink-0">
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleUpload}
        disabled={isUploading}
        aria-label="Choose images to upload"
      />
      <Button
        type="button"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
        ) : (
          <UploadIcon data-icon="inline-start" />
        )}
        {isUploading ? "Uploading…" : "Upload images"}
      </Button>
    </div>
  );
}
