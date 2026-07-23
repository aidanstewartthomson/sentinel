export type GetToken = () => Promise<string | null>;

export async function authHeaders(
  getToken: GetToken,
): Promise<HeadersInit> {
  const token = await getToken();
  if (!token) {
    throw new Error("Not signed in");
  }

  return { Authorization: `Bearer ${token}` };
}
