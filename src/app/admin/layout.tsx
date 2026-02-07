import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AdminSidebar from "@/domains/admin/components/sideBar";
import { authOptions } from "@/shared/lib/authOptions";

export const metadata: Metadata = {
  title: "Admin",
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }
  return (
    <div className="styles.adminLayout flex min-h-screen">
      <AdminSidebar />
      <div className="w-full">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Management System</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <span className="text-sm font-medium text-gray-600">{session.user?.name}</span>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
