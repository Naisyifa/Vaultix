import { getAuthToken } from "./auth";

const BASE = "/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) } });
  return res;
}
