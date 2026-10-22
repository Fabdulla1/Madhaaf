// Connections are interpretive summaries, not reconstructed ship tracks or flow counts.
// Coordinates locate modern reference points; Mandvi and London sometimes stand for regions.
export const diasporaPlaces: Record<string, { label: string; lon: number; lat: number; dx: number; dy: number; anchor?: "end" }> = {
  mandvi: { label: "Mandvi / Kutch", lon: 69.35, lat: 22.83, dx: 9, dy: -12 },
  mumbai: { label: "Bombay (Mumbai)", lon: 72.88, lat: 19.08, dx: -9, dy: 22, anchor: "end" },
  muscat: { label: "Muscat", lon: 58.4, lat: 23.59, dx: -8, dy: -13, anchor: "end" },
  zanzibar: { label: "Zanzibar", lon: 39.19, lat: -6.16, dx: 10, dy: 15 },
  mombasa: { label: "Mombasa", lon: 39.67, lat: -4.05, dx: 12, dy: -6 },
  nairobi: { label: "Nairobi", lon: 36.82, lat: -1.29, dx: 0, dy: -13 },
  kisumu: { label: "Kisumu", lon: 34.76, lat: -0.1, dx: -10, dy: -6, anchor: "end" },
  aden: { label: "Aden", lon: 45.03, lat: 12.78, dx: 10, dy: -15 },
  djibouti: { label: "Djibouti", lon: 43.15, lat: 11.59, dx: 12, dy: 0 },
  harar: { label: "Harar", lon: 42.13, lat: 9.31, dx: 12, dy: 17 },
  addis: { label: "Addis Ababa", lon: 38.76, lat: 9.03, dx: -10, dy: 15, anchor: "end" },
  britain: { label: "Britain (London reference)", lon: -0.13, lat: 51.51, dx: 14, dy: -15 },
};

export type DiasporaRoute = {
  from: string; to: string; bend: number; label: string; note: string;
  kind: "kutchi" | "context"; refs: number[];
};

export const diasporaMapStages: { period: string; title: string; description: string; routes: DiasporaRoute[] }[] = [
  {
    period: "1800–1895", title: "Before the Protectorate",
    description: "Kachchhi commercial networks and evidence of settlement before sustained British administration in Kenya.",
    routes: [
      { from: "mandvi", to: "muscat", bend: 25, kind: "kutchi", label: "Mandvi and Muscat", note: "Commercial connection in Goswami's account; the line does not reconstruct a particular voyage.", refs: [4] },
      { from: "mandvi", to: "zanzibar", bend: -35, kind: "kutchi", label: "Mandvi and Zanzibar: 1837 trade account", note: "Leech describes an annual trading cycle, outward in December and returning in April. This connection is commerce, not a household migration or an exact sailing track.", refs: [27] },
      { from: "mandvi", to: "aden", bend: 12, kind: "kutchi", label: "The Veerasil's 1835 voyage", note: "Burnes records Mandvi, al-Shihr, al-Mukalla, Aden and Berbera. Only Mandvi and Aden are shown here; the other stops are not plotted. A commercial voyage, not an Ethiopian settlement route.", refs: [31] },
      { from: "muscat", to: "zanzibar", bend: -55, kind: "kutchi", label: "Muscat and Zanzibar", note: "Ports within the Kachchhi trading network. Exchange was reciprocal, so no migration arrow is assigned.", refs: [3, 4] },
      { from: "mandvi", to: "mombasa", bend: -70, kind: "kutchi", label: "Kutch to Mombasa", note: "Kirk's 1873 letter reports Memon arrivals around 1853 and family residence by 1873. The 1915 judgment adds a family chronology. Mandvi represents Kutch; embarkation and intermediate stops are unknown.", refs: [34, 6] },
    ],
  },
  {
    period: "1895–1963", title: "Colonial Kenya",
    description: "Further community migration and the inland railway corridor. Railway recruitment involved a wider population than Kutchi migrants.",
    routes: [
      { from: "mandvi", to: "mombasa", bend: -70, kind: "kutchi", label: "Further settlement in Kenya", note: "The Nairobi Samaj's account places ancestral migration in the 1890s and further settlement after the Second World War. Mandvi is a regional reference.", refs: [21] },
      { from: "mombasa", to: "nairobi", bend: 4, kind: "context", label: "Mombasa and the interior", note: "Simplified railway corridor; broader Asian and African labour history, without a Kutchi-specific passenger count.", refs: [11] },
      { from: "nairobi", to: "kisumu", bend: 1, kind: "context", label: "Towards Lake Victoria", note: "Kisumu marks the lake end of the corridor. This line is not a reconstruction of the track alignment.", refs: [11] },
    ],
  },
  {
    period: "Late 1800s–1970s", title: "The Ethiopian connections",
    description: "An overlapping chronology: broader Indian migration through Aden and the Horn. Kutch is among recorded origins, but every leg cannot be assigned to Kutchi families.",
    routes: [
      { from: "mumbai", to: "aden", bend: -40, kind: "context", label: "Bombay to Aden", note: "A documented pattern in Indian family accounts. Some migrants lived and worked in Aden before continuing.", refs: [14] },
      { from: "aden", to: "djibouti", bend: 3, kind: "context", label: "Aden and Djibouti", note: "One connection in the wider Red Sea network, with varied individual itineraries.", refs: [13, 14] },
      { from: "djibouti", to: "harar", bend: 3, kind: "context", label: "Ports and Harar", note: "Schematic inland connection; the network also used other ports, including Zeila. It is not an exclusive route.", refs: [13] },
      { from: "harar", to: "addis", bend: 10, kind: "context", label: "Harar and Addis Ababa", note: "Centres of Indian commerce and craftsmanship. The line summarises a network, not a journey taken by every family.", refs: [15, 16] },
    ],
  },
  {
    period: "Since the 1960s", title: "Onward migration and continuing homes",
    description: "Britain was one destination in the wider Kenyan Asian diaspora. Communities also remained in Kenya. No Ethiopian onward route is plotted without family-level evidence.",
    routes: [
      { from: "mombasa", to: "britain", bend: -80, kind: "context", label: "Kenya to Britain", note: "A wider Kenyan Asian movement. Mombasa and London are geographic references, not verified departure and arrival cities for each traveller.", refs: [19, 20] },
    ],
  },
];
