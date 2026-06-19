import type { Metadata } from "next";
export const metadata: Metadata = { title: "Garson | EatOs" };
export default function GarsonLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen" style={{ backgroundColor: "#0F172A", color: "#F8FAFC" }}>{children}</div>;
}
