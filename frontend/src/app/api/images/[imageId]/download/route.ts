import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ detail: "unauthorized" }, { status: 401 });
  }

  const { imageId } = await context.params;
  const response = await fetch(
    `${process.env.BACKEND_URL}/images/${encodeURIComponent(imageId)}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { detail: "Could not download image" },
      { status: response.status },
    );
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");
  if (contentType) headers.set("content-type", contentType);
  if (contentDisposition) headers.set("content-disposition", contentDisposition);

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
