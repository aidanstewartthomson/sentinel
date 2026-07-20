import "server-only";

import { auth } from "@clerk/nextjs/server";

import { ImageMetadata } from "../types/image";

export async function listImages(): Promise<ImageMetadata[]> {
  await auth.protect();
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Not signed in");
  }

  const response = await fetch(`${process.env.BACKEND_URL}/images`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Could not load images");
  return response.json();
}
