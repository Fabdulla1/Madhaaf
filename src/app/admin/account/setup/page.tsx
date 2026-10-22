import { redirect } from "next/navigation";
import { requireAdminLayout } from "@/lib/server/auth";
import { AccountSetupForm } from "@/components/admin/account-setup-form";

export default async function AccountSetupPage() {
  const session = await requireAdminLayout();
  if (!session.mustChangePassword) redirect("/admin");
  return <AccountSetupForm />;
}
