import { requireAdminPage } from "@/lib/server/auth";
import AdminOverview from "@/components/admin/overview-page";

export default async function AdminPage() {
  await requireAdminPage();
  return <AdminOverview />;
}
