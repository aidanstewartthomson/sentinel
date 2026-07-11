"use client";

import { ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { UploadIcon } from "lucide-react";
import { uploadImage } from "@/lib/api/images.client";

export function UploadButton() {
  const router = useRouter();

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadImage(file);
    event.target.value = "";
    router.refresh();
  }

  return (
    <div className="shrink-0">
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleUpload}
      />
      <Button
        size="sm"
        className="gap-1.5"
        nativeButton={false}
        render={<label htmlFor="image-upload" aria-label="Upload image" />}
      >
        <UploadIcon data-icon="inline-start" />
        Upload image
      </Button>
    </div>
  );
}
