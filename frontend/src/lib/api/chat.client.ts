import { authHeaders, type GetToken } from "./auth.client";

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  text: string;
};

export type ChatReply = {
  reply: string;
};

export async function sendChatMessage(
  message: string,
  history: ChatHistoryMessage[],
  getToken: GetToken,
): Promise<ChatReply> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      ...(await authHeaders(getToken)),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) throw new Error("Could not send chat message");
  return response.json();
}
