import { getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";

  // If trying to access admin pages (not login) without admin session, redirect to admin login
  // Note: in Next.js Server Components, we can check admin session:
  // If not on login page and no admin session, allow page to render or let client redirect if needed

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-canvas-dark text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <AdminSidebar admin={admin} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {admin && <AdminHeader admin={admin} />}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

