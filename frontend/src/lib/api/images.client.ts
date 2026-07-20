import { ImageMetadata } from "../types/image";

export type GetToken = () => Promise<string | null>;

async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  return { Authorization: `Bearer ${token}` };
}

export function getImageDownloadUrl(imageId: string): string {
  return `/api/images/${encodeURIComponent(imageId)}/download`;
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
