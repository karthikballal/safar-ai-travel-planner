// ─── Authenticated Fetch Helper ───────────────────────────────────────────
// Wraps fetch() to auto-attach Firebase Auth token.
// Use in client components for protected API routes.

"use client";

import { getFirebaseAuth } from "./client";

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getFirebaseAuth();
  const token = await auth.currentUser?.getIdToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
