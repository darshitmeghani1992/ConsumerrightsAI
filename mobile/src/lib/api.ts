import { getToken } from "./authToken";
import type { CaseDetail, CaseSummary, HistoryEntry, IntakeStepResponse } from "./types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not set — add it to mobile/.env");
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Hard ceiling on any request. The AI intake step is the slow one; without a
// timeout a hung server would leave the app spinning "One moment…" forever.
// 70s sits just above the backend's own 60s function limit, so a real timeout
// there surfaces as a clean error the user can retry rather than an endless wait.
const REQUEST_TIMEOUT_MS = 70_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError("That took too long — please try again.", 504);
    }
    throw new ApiError("Network error — please try again.", 0);
  } finally {
    clearTimeout(timer);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error || "Something went wrong.", res.status);
  }
  return body as T;
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ ok: true; token: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ ok: true; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  me: () => request<{ id: string; email: string }>("/api/me"),

  intakeStep: (history: HistoryEntry[]) =>
    request<IntakeStepResponse>("/api/intake/step", {
      method: "POST",
      body: JSON.stringify({ history }),
    }),

  listCases: () => request<{ cases: CaseSummary[] }>("/api/cases"),

  getCase: (id: string) => request<{ case: CaseDetail }>(`/api/cases/${id}`),
};
