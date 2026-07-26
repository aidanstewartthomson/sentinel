import { authHeaders, type GetToken } from "./auth.client";
import type { ImageMetadata } from "../types/image";

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  text: string;
};

export type ChatToolId = "search";

export type ChatReply = {
  reply: string;
  results?: ImageMetadata[];
  tool_label?: string | null;
};

export async function sendChatMessage(
  message: string,
  history: ChatHistoryMessage[],
  getToken: GetToken,
  tool?: ChatToolId | null,
  imageIds: string[] = [],
): Promise<ChatReply> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      ...(await authHeaders(getToken)),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
      ...(tool ? { tool } : {}),
      ...(imageIds.length ? { image_ids: imageIds } : {}),
    }),
  });

  if (!response.ok) throw new Error("Could not send chat message");
  return response.json();
}
