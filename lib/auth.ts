import { cookies } from "next/headers";

export type Role = "admin" | "mudur" | "garson" | "sef";

export interface Session {
  userId: number | null;
  role: Role;
  isSuperAdmin?: boolean;
}

const SESSION_COOKIE = "admin_session";
const LEGACY_VALUE = "authenticated";
const SUPERADMIN_VALUE = "superadmin";

export { SESSION_COOKIE, SUPERADMIN_VALUE };

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  if (!val) return null;

  if (val === SUPERADMIN_VALUE) return { userId: null, role: "admin", isSuperAdmin: true };
  if (val === LEGACY_VALUE) return { userId: null, role: "admin" };

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
  if (session.isSuperAdmin) return true;
  return roles.includes(session.role);
}

export function checkPassword(password: string): boolean {
  return password === (process.env.ADMIN_PASSWORD ?? "admin123");
}

export function checkSuperAdminPassword(password: string): boolean {
  const sa = process.env.SUPER_ADMIN_PW ?? process.env.SUPER_ADMIN_PASSWORD;
  return !!sa && password === sa;
}

export function makeSessionValue(userId: number, role: Role): string {
  return `${userId}|${role}`;
}
