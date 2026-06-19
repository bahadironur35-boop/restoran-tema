import { cookies } from "next/headers";

export type Role = "admin" | "mudur" | "garson" | "sef";

export interface Session {
  userId: number | null; // null = env fallback (legacy admin)
  role: Role;
}

const SESSION_COOKIE = "admin_session";
// Legacy değer — eski deploy'larla uyumluluk
const LEGACY_VALUE = "authenticated";

export { SESSION_COOKIE };

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  if (!val) return null;

  // Legacy tek-şifre session
  if (val === LEGACY_VALUE) return { userId: null, role: "admin" };

  // Yeni format: "userId|role"
  const [idStr, role] = val.split("|");
  const userId = parseInt(idStr, 10);
  if (!userId || !role) return null;
  return { userId, role: role as Role };
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function hasRole(...roles: Role[]): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return roles.includes(session.role);
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === adminPassword;
}

export function makeSessionValue(userId: number, role: Role): string {
  return `${userId}|${role}`;
}
