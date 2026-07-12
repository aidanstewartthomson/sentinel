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

  const image: ImageMetadata | null = await response.json();
  if (!image) throw new Error("Image not found");

  return image;
}
