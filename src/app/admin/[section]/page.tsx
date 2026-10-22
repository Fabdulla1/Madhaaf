import { notFound } from "next/navigation";
import { ResourceList } from "@/components/admin/resource-list";
import { resources } from "@/lib/admin-config";
import { RelationshipManager } from "@/components/admin/relationship-manager";
import { MediaManager } from "@/components/admin/media-manager";
import { DraftsPage } from "@/components/admin/drafts-page";
import { SettingsPage } from "@/components/admin/settings-page";
import { UsersPage } from "@/components/admin/users-page";
import { requireAdminPage } from "@/lib/server/auth";

export default async function AdminSection({params}:{params:Promise<{section:string}>}) {
  const session = await requireAdminPage();
  const {section}=await params;
  if(section==="family-relationships") return <RelationshipManager/>;
  if(section==="media") return <MediaManager/>;
  if(section==="drafts") return <DraftsPage/>;
  if(section==="settings") return <SettingsPage/>;
  if(section==="users") {
    if (!session.isFounder) notFound();
    return <UsersPage/>;
  }
  if(resources[section]) return <ResourceList section={section} config={resources[section]}/>;
  notFound();
}
