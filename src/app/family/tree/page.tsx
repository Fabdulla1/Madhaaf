import { connection } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { FamilyExplorer } from "@/components/family/family-explorer";

export const instant = false;

export const metadata={title:"Family tree | Kutchi Roots"};
export default async function TreePage({searchParams}:{searchParams:Promise<{view?:string}>}){
  await connection();
  const {view}=await searchParams;
  if(view==="public")return <FamilyExplorer publicView/>;
  const admin=await getAdminSession();
  return <FamilyExplorer publicView={!admin}/>;
}
