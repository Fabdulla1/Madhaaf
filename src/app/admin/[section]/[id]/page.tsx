import { notFound } from "next/navigation";
import { ResourceEditor } from "@/components/admin/resource-editor";
import { resources } from "@/lib/admin-config";

export default async function AdminEditor({params}:{params:Promise<{section:string;id:string}>}) {
  const {section,id}=await params;
  if(!resources[section])notFound();
  return <ResourceEditor section={section} id={id} config={resources[section]}/>;
}
