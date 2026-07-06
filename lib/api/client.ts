export async function api<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}