import "server-only";
import { getAllCitiesInWorld, getCountries, getStatesOfCountry } from "@countrystatecity/countries";
import { normalizePlace, type LocationKind, type LocationOption } from "@/lib/locations";

type IndexedPlace = LocationOption & { name: string; search: string };
// Only public geographic data is cached here; no profile or request data.
let indexPromise: Promise<IndexedPlace[]> | undefined;

async function buildIndex(): Promise<IndexedPlace[]> {
  const countries = await getCountries();
  const [statesByCountry, cities] = await Promise.all([
    Promise.all(countries.map(country => getStatesOfCountry(country.iso2))),
    getAllCitiesInWorld(),
  ]);
  // Missing deployment data must surface as an error, not an empty world list.
  if (countries.length < 200 || cities.length < 100000) throw Error("Location dataset is incomplete");
  const countryNames = new Map(countries.map(country => [country.iso2, country.name]));
  const states = statesByCountry.flat();
  const stateNames = new Map(states.map(state => [state.id, state.name]));
  const index: IndexedPlace[] = [];
  function add(id: string, kind: LocationKind, name: string, context: string[], aliases: string[]) {
    const label = [name, ...context.filter(Boolean)].join(", ");
    if (label.length > 300) return;
    index.push({ id, kind, label, name: normalizePlace(name), search: normalizePlace([label, ...aliases].join(" ")) });
  }
  for (const country of countries) add(`country-${country.id}`, "country", country.name, [], [country.iso2, country.iso3, country.native]);
  for (const state of states) add(`state-${state.id}`, "state", state.name, [countryNames.get(state.country_code) ?? state.country_code], [state.native ?? "", ...Object.values(state.translations ?? {})]);
  for (const city of cities) add(`city-${city.id}`, "city", city.name, [stateNames.get(city.state_id) ?? "", countryNames.get(city.country_code) ?? city.country_code], [city.native ?? "", ...Object.values(city.translations ?? {})]);
  return index.sort((a, b) => a.label.localeCompare(b.label, "en"));
}

export async function searchLocations(query: string, kind: LocationKind | "all" = "all") {
  indexPromise ??= buildIndex().catch(cause => { indexPromise = undefined; throw cause; });
  const index = await indexPromise;
  const normalized = normalizePlace(query);
  const tokens = normalized.split(" ").filter(Boolean);
  const ranked: IndexedPlace[][] = [[], [], []];
  let count = 0;
  for (const place of index) {
    if (kind !== "all" && place.kind !== kind) continue;
    if (!normalized && kind === "all" && place.kind !== "country") continue;
    if (!tokens.every(token => place.search.includes(token))) continue;
    count++;
    const rank = place.name === normalized ? 0 : place.name.startsWith(normalized) ? 1 : 2;
    // Bound work and response size even for very broad searches.
    if (ranked[rank].length < 30) ranked[rank].push(place);
  }
  const data = ranked.flat().slice(0, 30).map(({ id, kind, label }) => ({ id, kind, label }));
  return { data, hasMore: count > data.length };
}
