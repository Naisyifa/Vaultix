export function setAuth(token: string, user: unknown) {
  localStorage.setItem("vaultix_token", token);
  localStorage.setItem("vaultix_user", JSON.stringify(user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem("vaultix_token");
}

export function getStoredUser() {
  const u = localStorage.getItem("vaultix_user");
  return u ? JSON.parse(u) : null;
}

export function clearAuth() {
  localStorage.removeItem("vaultix_token");
  localStorage.removeItem("vaultix_user");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("vaultix_token");
}
