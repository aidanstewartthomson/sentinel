import { ImageMetadata } from "../types/image";
import { authHeaders, type GetToken } from "./auth.client";

export function getImageContentUrl(imageId: string): string {
  return `/api/images/${encodeURIComponent(imageId)}/content`;
}

export function getImageThumbnailUrl(imageId: string): string {
  return `/api/images/${encodeURIComponent(imageId)}/thumbnail`;
}

export function getImageDownloadUrl(imageId: string): string {
  return `/api/images/${encodeURIComponent(imageId)}/download`;
}

export async function searchImages(
  query: string,
  getToken: GetToken,
): Promise<ImageMetadata[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/images/search?${params}`, {
    headers: await authHeaders(getToken),
  });

  if (!response.ok) throw new Error("Could not search images");
  return response.json();
}

export async function uploadImage(
  file: File,
  getToken: GetToken,
): Promise<ImageMetadata> {
  const body = new FormData();
  body.append("image", file);

  const response = await fetch("/api/images", {
    method: "POST",
    headers: await authHeaders(getToken),
    body,
  });

  if (!response.ok) throw new Error("Could not upload image");
  return response.json();
}

export async function renameImage(
  imageId: string,
  filename: string,
  getToken: GetToken,
): Promise<ImageMetadata> {
  const response = await fetch(`/api/images/${imageId}`, {
    method: "PATCH",
    headers: {
      ...(await authHeaders(getToken)),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) throw new Error("Could not rename image");
  return response.json();
}

export async function deleteImage(
  imageId: string,
  getToken: GetToken,
): Promise<ImageMetadata> {
  const response = await fetch(`/api/images/${imageId}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  });

  if (!response.ok) throw new Error("Could not delete image");
  return response.json();
}
