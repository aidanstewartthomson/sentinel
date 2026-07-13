"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/api/images.client";

export function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      await uploadImage(file);
      toast.success("Image uploaded", {
        description: `${file.name} is now available in your library.`,
      });
      router.refresh();
    } catch {
      toast.error("Upload failed", {
        description: "The image could not be uploaded. Please try again.",
      });
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
        className="sr-only"
        onChange={handleUpload}
        disabled={isUploading}
        aria-label="Choose an image to upload"
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
        {isUploading ? "Uploading…" : "Upload image"}
      </Button>
    </div>
  );
}
