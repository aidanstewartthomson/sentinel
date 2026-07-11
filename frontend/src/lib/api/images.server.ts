import "server-only";
import { ImageMetadata } from "../types/image";

export async function listImages(): Promise<ImageMetadata[]> {
  const response = await fetch(`${process.env.BACKEND_URL}/images`, {
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Could not load images");
  return response.json();
}
