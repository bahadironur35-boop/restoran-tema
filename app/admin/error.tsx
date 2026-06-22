"use client";
export default function AdminError({ error }: { error: Error }) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace", background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ color: "red" }}>Admin Hata</h1>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{error?.message}</pre>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#666" }}>{error?.stack}</pre>
    </div>
  );
}
