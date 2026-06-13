import type {
  AuthResponse,
  Check,
  CheckNotificationSettings,
  CheckSettings,
  ChecksListResponse,
  CreateCheckInput,
  PingLogsResponse,
  UserMe,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const TOKEN_KEY = "apc_token";
const USER_KEY = "apc_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? "Request failed", res.status, body);
  }

  return res.json();
}

export function signup(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
  clearToken();
}

export function getCurrentUser() {
  return apiFetch<UserMe>("/api/user/me");
}

export function getChecks(params?: { q?: string }) {
  const search = new URLSearchParams();
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const qs = search.toString();
  return apiFetch<ChecksListResponse>(`/api/checks${qs ? `?${qs}` : ""}`);
}

export function getCheck(id: string) {
  return apiFetch<CheckSettings>(`/api/checks/${id}`);
}

export function getCheckPingLogs(checkId: string, limit = 100) {
  return apiFetch<PingLogsResponse>(
    `/api/checks/${checkId}/ping-logs?limit=${limit}`,
  );
}

export function createCheck(body: CreateCheckInput) {
  return apiFetch<Check>("/api/checks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteCheck(id: string) {
  return apiFetch<{ ok: true }>(`/api/checks/${id}`, { method: "DELETE" });
}

export function updateCheckPaused(id: string, paused: boolean) {
  return apiFetch<Check>(`/api/checks/${id}/paused`, {
    method: "PATCH",
    body: JSON.stringify({ paused }),
  });
}

export function getPingUrl(uuid: string) {
  return `${API_URL}/ping/${uuid}`;
}

export function getCheckNotifications(checkId: string) {
  return apiFetch<CheckNotificationSettings>(
    `/api/checks/${checkId}/notifications`,
  );
}

export function updateCheckNotifications(
  checkId: string,
  body: {
    alertWebhookUrl?: string | null;
    alertEmail?: string | null;
  },
) {
  return apiFetch<CheckNotificationSettings>(
    `/api/checks/${checkId}/notifications`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
