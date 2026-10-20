import { getAdmin } from "@/lib/supabase/server";
import { error } from "@/lib/server/http";
import { searchLocations } from "@/lib/server/location-search";

export async function GET(request: Request) {
  if (!(await getAdmin())) return error("Unauthorized", 401);
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  const kind = params.get("kind") ?? "all";
  if (query.length > 100 || !["all", "country", "state", "city"].includes(kind)) return error("Invalid location search", 400);
  try {
    const results = await searchLocations(query, kind as "all" | "country" | "state" | "city");
    return Response.json(results, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return error("Location search is unavailable. You can still enter a place manually.", 503);
  }
}
