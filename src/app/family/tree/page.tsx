import { requireAdminPage } from "@/lib/server/auth";
import { FamilyExplorer } from "@/components/family/family-explorer";

export const instant = false;

export const metadata={title:"Private family tree | Kutchi Roots"};
export default async function TreePage(){await requireAdminPage();return <FamilyExplorer/>}
