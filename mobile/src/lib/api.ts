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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
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
