/**
 * api.ts – FounderFit API Client
 *
 * Wraps all fetch calls to the FastAPI backend.
 * Reads VITE_API_BASE_URL from environment (defaults to http://localhost:8000).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── Token helpers ──────────────────────────────────────────────
// NOTE: Storing tokens in localStorage is acceptable for this learning
// project but is NOT recommended for production. In production, prefer
// httpOnly cookies set by the server to prevent XSS token theft.

const TOKEN_KEY = "founderfit_access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── Core fetch wrapper ─────────────────────────────────────────

interface ApiError {
  status: number;
  message: string;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw {
      status: 0,
      message:
        "Unable to reach the server. Please check your connection and try again.",
    } as ApiError;
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail) && body.detail.length > 0) {
        // Pydantic validation errors
        message = body.detail.map((d: { msg: string }) => d.msg).join("; ");
      }
    } catch {
      // ignore JSON parse error
    }

    // Friendly overrides for common status codes
    if (res.status === 401) {
      message = "Your session has expired. Please log in again.";
    } else if (res.status === 404) {
      message = "The requested resource was not found.";
    } else if (res.status >= 500) {
      message = "A server error occurred. Please try again later.";
    }

    throw { status: res.status, message } as ApiError;
  }

  return res.json() as Promise<T>;
}

// ── Intent mapping ─────────────────────────────────────────────
// The frontend uses 'cofounder' to mean "I want a cofounder" (user IS a
// founder) and 'founder' to mean "I want a startup" (user IS a cofounder).
// The backend stores what the user IS, so we flip the value.

function frontendToBackendIntent(
  intent: "founder" | "cofounder"
): "founder" | "cofounder" {
  return intent === "cofounder" ? "founder" : "cofounder";
}

function backendToFrontendIntent(
  intent: "founder" | "cofounder" | null | undefined
): "founder" | "cofounder" | null {
  if (!intent) return null;
  return intent === "founder" ? "cofounder" : "founder";
}

// ── API functions ──────────────────────────────────────────────

interface SignupResponse {
  id?: string;
  email?: string;
  access_token?: string;
  [key: string]: unknown;
}

interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string | null;
  intent: "founder" | "cofounder" | null;
  startup_name: string | null;
  one_liner_pitch: string | null;
  industry: string | null;
  current_stage: string | null;
  cofounder_skill_needed: string | null;
  skill_domain: string | null;
  years_experience: number | null;
  short_bio: string | null;
  preferred_industry: string | null;
  open_to_remote: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchProfile {
  id: string;
  full_name: string;
  intent: "founder" | "cofounder";
  skill_domain: string | null;
  years_experience: number | null;
  short_bio: string | null;
  preferred_industry: string | null;
  open_to_remote: string | null;
  startup_name: string | null;
  one_liner_pitch: string | null;
  industry: string | null;
  current_stage: string | null;
  cofounder_skill_needed: string | null;
  is_demo: boolean;
  [key: string]: unknown;
}

export async function signup(
  fullName: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.access_token) {
    setToken(data.access_token);
  }

  return data;
}

export async function getProfile(): Promise<Profile> {
  const profile = await apiFetch<Profile>("/profile/me");
  return profile;
}

/** Returns the user's profile with intent converted to frontend convention. */
export async function getProfileWithFrontendIntent(): Promise<Profile> {
  const profile = await getProfile();
  return {
    ...profile,
    intent: backendToFrontendIntent(profile.intent) as
      | "founder"
      | "cofounder"
      | null,
  };
}

export async function updateProfile(fields: {
  intent?: "founder" | "cofounder";
  startup_name?: string;
  one_liner_pitch?: string;
  industry?: string;
  current_stage?: string;
  cofounder_skill_needed?: string;
  skill_domain?: string;
  years_experience?: number;
  short_bio?: string;
  preferred_industry?: string;
  open_to_remote?: string;
}): Promise<Profile> {
  return apiFetch<Profile>("/profile/me", {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

/**
 * Update profile with frontend intent (flips to backend convention).
 * Use this when the intent value comes from the frontend's IntentScreen.
 */
export async function updateProfileWithFrontendIntent(fields: {
  intent?: "founder" | "cofounder";
  startup_name?: string;
  one_liner_pitch?: string;
  industry?: string;
  current_stage?: string;
  cofounder_skill_needed?: string;
  skill_domain?: string;
  years_experience?: number;
  short_bio?: string;
  preferred_industry?: string;
  open_to_remote?: string;
}): Promise<Profile> {
  const payload = { ...fields };
  if (payload.intent) {
    payload.intent = frontendToBackendIntent(payload.intent);
  }
  return updateProfile(payload);
}

export async function getMatches(): Promise<MatchProfile[]> {
  return apiFetch<MatchProfile[]>("/matches");
}

export async function sendConnection(
  toProfileId: string
): Promise<{ id: string; status: string; [key: string]: unknown }> {
  return apiFetch("/connections", {
    method: "POST",
    body: JSON.stringify({ to_profile_id: toProfileId }),
  });
}

export function logout(): void {
  clearToken();
}

/**
 * Generate initials from a full name.
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}