import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { imageId } = await context.params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ detail: "unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/images/${encodeURIComponent(imageId)}/thumbnail`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { detail: "Could not load image" },
      { status: response.status },
    );
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const cacheControl = response.headers.get("cache-control");
  if (contentType) headers.set("content-type", contentType);
  if (cacheControl) headers.set("cache-control", cacheControl);

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
