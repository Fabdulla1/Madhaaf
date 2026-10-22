import { requireAdminLayout } from "@/lib/server/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const instant = false;

export default async function AdminLayout({children}:{children:React.ReactNode}) {
  const session = await requireAdminLayout();
  return <AdminShell email={session.user.email ?? "Administrator"} isFounder={session.isFounder} mustChangePassword={session.mustChangePassword}>{children}</AdminShell>;
}
