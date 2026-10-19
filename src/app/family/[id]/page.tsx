import { requireAdminPage } from "@/lib/server/auth";
import { FamilyProfile } from "@/components/family/family-profile";

export const instant = false;

export const metadata={title:"Private family profile | Kutchi Roots"};
export default async function ProfilePage({params}:{params:Promise<{id:string}>}){await requireAdminPage();const {id}=await params;return <FamilyProfile id={id}/>}
