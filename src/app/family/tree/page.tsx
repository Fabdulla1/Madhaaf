import { connection } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { FamilyExplorer } from "@/components/family/family-explorer";
import { PublicShell } from "@/components/public/shell";

export const instant = false;

export const metadata={title:"Family tree"};
export default async function TreePage({searchParams}:{searchParams:Promise<{view?:string}>}){
  await connection();
  const {view}=await searchParams;
  if(view==="public")return <PublicShell><FamilyExplorer publicView/></PublicShell>;
  const admin=await getAdminSession();
  return admin?<main><FamilyExplorer/></main>:<PublicShell><FamilyExplorer publicView/></PublicShell>;
}
