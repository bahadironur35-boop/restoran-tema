import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
