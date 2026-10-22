import { notFound } from "next/navigation";
import { ResourceEditor } from "@/components/admin/resource-editor";
import { resources } from "@/lib/admin-config";
import { requireAdminPage } from "@/lib/server/auth";

export default async function AdminEditor({params}:{params:Promise<{section:string;id:string}>}) {
  await requireAdminPage();
  const {section,id}=await params;
  if(!resources[section])notFound();
  return <ResourceEditor section={section} id={id} config={resources[section]}/>;
}
