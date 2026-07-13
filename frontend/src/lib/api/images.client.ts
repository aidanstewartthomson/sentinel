import { ImageMetadata } from "../types/image";

export function getImageDownloadUrl(imageId: string): string {
  return `/api/images/${encodeURIComponent(imageId)}/download`;
}

export async function uploadImage(file: File): Promise<ImageMetadata> {
  const body = new FormData();
  body.append("image", file);

  const response = await fetch("/api/images", {
    method: "POST",
    body,
  });

  if (!response.ok) throw new Error("Could not upload image");
  return response.json();
}

export async function renameImage(
  imageId: string,
  filename: string,
): Promise<ImageMetadata> {
  const response = await fetch(`/api/images/${imageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) throw new Error("Could not rename image");
  return response.json();
}

export async function deleteImage(imageId: string): Promise<ImageMetadata> {
  const response = await fetch(`/api/images/${imageId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Could not delete image");
  return response.json();
}
