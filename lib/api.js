const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TOKEN_EXPIRES_AT_KEY = "token_expires_at";
const USER_KEY = "auth_user";

export const SESSION_REFRESHED_EVENT = "auth:session-refreshed";
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

let refreshTimer = null;

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function scheduleProactiveRefresh() {
  if (typeof window === "undefined") return;
  clearTimeout(refreshTimer);

  const expiresAt = Number(window.localStorage.getItem(TOKEN_EXPIRES_AT_KEY));
  if (!expiresAt) return;

  const msUntilRefresh = Math.max(expiresAt - Date.now() - 60_000, 0);

  refreshTimer = setTimeout(() => {
    refreshAccessToken().catch(() => { });
  }, msUntilRefresh);
}

export function saveSession({ access_token, refresh_token, expires_in, user }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }
  if (expires_in) {
    const expiresAt = Date.now() + expires_in * 1000;
    window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
  }
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  scheduleProactiveRefresh();
}

export function saveUser(user) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  clearTimeout(refreshTimer);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  window.localStorage.removeItem(USER_KEY);
}

let refreshPromise = null;

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Tidak ada refresh token, silakan login kembali");
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Gagal me-refresh token");
  }

  saveSession(json.data);

  window.dispatchEvent(
    new CustomEvent(SESSION_REFRESHED_EVENT, { detail: json.data.user })
  );

  return json.data;
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function forceLogout() {
  clearSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    window.location.href = "/login";
  }
}

export async function apiFetch(
  path,
  { method = "GET", body, headers = {}, auth = true, _isRetry = false } = {}
) {
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch (err) { }

  if (res.status === 401 && auth && !_isRetry && path !== "/auth/refresh") {
    try {
      await refreshAccessToken();
      return apiFetch(path, { method, body, headers, auth, _isRetry: true });
    } catch (refreshErr) {
      forceLogout();
      throw new Error("Sesi berakhir, silakan login kembali");
    }
  }

  if (!res.ok || json?.success === false) {
    const message = json?.message || `Request gagal (${res.status})`;
    throw new Error(message);
  }

  return json?.data;
}
