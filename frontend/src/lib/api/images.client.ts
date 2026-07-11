import { ImageMetadata } from "../types/image";

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
