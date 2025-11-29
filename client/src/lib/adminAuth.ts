const SESSION_TOKEN_KEY = "admin_session_token";
const SESSION_EXPIRY_KEY = "admin_session_expiry";

export function getSessionToken(): string | null {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  
  if (!token || !expiry) return null;
  
  if (Date.now() > parseInt(expiry)) {
    clearSession();
    return null;
  }
  
  return token;
}

export function setSession(token: string, expiresInSeconds: number) {
  const expiryTime = Date.now() + (expiresInSeconds * 1000);
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
}

export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}

export function refreshSessionExpiry(expiresInSeconds: number = 120) {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (token) {
    const expiryTime = Date.now() + (expiresInSeconds * 1000);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
  }
}

export function isSessionValid(): boolean {
  return !!getSessionToken();
}

export function getRemainingSessionTime(): number {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiry) return 0;
  
  const remaining = parseInt(expiry) - Date.now();
  return Math.max(0, remaining);
}

// Legacy exports for compatibility
export function getAdminToken(): string | null {
  return getSessionToken();
}

export function setAdminToken(token: string) {
  setSession(token, 120);
}

export function clearAdminToken() {
  clearSession();
}

export function updateLastActivity() {
  refreshSessionExpiry(120);
}

export function isAdminAuthenticated(): boolean {
  return isSessionValid();
}

export function isSessionExpired(): boolean {
  return !isSessionValid();
}

export function getLastActivity(): number | null {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiry) return null;
  return parseInt(expiry) - (120 * 1000);
}
