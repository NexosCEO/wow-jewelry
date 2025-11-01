// Simple admin authentication
// The admin access key should be stored securely
export function getAdminToken(): string | null {
  return localStorage.getItem("admin_access_key");
}

export function setAdminToken(token: string) {
  localStorage.setItem("admin_access_key", token);
}

export function clearAdminToken() {
  localStorage.removeItem("admin_access_key");
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}
