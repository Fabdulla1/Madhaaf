import { getAdmin } from "@/lib/supabase/server";
import { error, json } from "@/lib/server/http";
import { findDuplicates } from "@/lib/server/duplicate-review";

export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return error("Unauthorized", 401);
  const params = new URL(request.url).searchParams;
  const entity = params.get("entity"), query = (params.get("q") ?? "").trim();
  if ((entity !== "dictionary" && entity !== "people") || !query || query.length > 200) return error("Invalid duplicate search", 400);
  try { return json(await findDuplicates(admin.supabase, entity, query, false, request.signal)); }
  catch { return error("Could not load suggestions. Saving will check again.", 503); }
}
