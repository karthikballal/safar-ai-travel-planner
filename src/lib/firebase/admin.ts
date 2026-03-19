// ─── Firebase Admin SDK ───────────────────────────────────────────────────
// Server-side only. Used in API routes for auth token verification + Firestore.
// Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string) or
// GOOGLE_APPLICATION_CREDENTIALS (file path).

import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    }
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS or Application Default Credentials
  return initializeApp();
}

let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

export function getAdminAuth(): Auth {
  if (_adminAuth) return _adminAuth;
  _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}

export function getAdminDb(): Firestore {
  if (_adminDb) return _adminDb;
  _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

// ─── Helper: verify Bearer token from request ─────────────────────────────

export async function verifyAuthToken(request: Request): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
