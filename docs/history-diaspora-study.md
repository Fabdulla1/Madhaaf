# Kenya and Ethiopia diaspora study

Published editorial study: `/history/kutchi-diaspora-kenya-ethiopia`, by Farhan Abdulla, first online publication 22 October 2026.

## Content and publication

This is a source-controlled historical research synthesis, not an independently peer-reviewed journal article. It makes no claim of new field interviews or visits to archival repositories. Digitised primary records are consulted and identified by edition and page. Access limits appear in the public bibliography, including sources consulted through an abstract, introduction or publisher description.

- `src/lib/history-diaspora.ts`: article, evidence chronology and numbered references.
- `src/lib/diaspora-map.ts`: places, periods, source references and route limitations.
- `src/lib/diaspora-land.json`: display paths derived from Natural Earth 1:110m land, public domain. Coordinates are longitude × 10 and negative latitude × 10, rounded to one decimal. No country boundaries are drawn.
- `src/components/public/history-diaspora.tsx`: server-rendered article, bibliography, map transcript, figure credits and History feature.
- `src/components/public/diaspora-map.tsx`: period controls, optional animation and motion preferences.
- `src/app/history/diaspora.css`: responsive reading, citations, map and print styles.

The History index and its loading state live in the `(archive)` route group, preserving the `/history` URL while keeping the static study outside that streaming loading boundary. The study has a dedicated static route; CMS detail routes stay under `[slug]`. SVG titles use a single string child to preserve server/client hydration.

The study follows the source-controlled approach used for the language research collection. It is not inserted into the authenticated History CMS. Existing CMS articles, their APIs and publication permissions remain in place. The study's slug is reserved by the public route. The History index includes it for All stories, Diaspora and Mombasa community; unrelated categories exclude it. Updating the study requires a reviewed source change and deployment, not an administrator CMS edit.

## Evidence rules

1. Trade, temporary travel and household settlement are different claims.
2. Indian, Gujarati, Memon, Khoja and Kutchi labels are not interchangeable. The 1915 judgment is specific evidence for the families and community it discusses.
3. Approximate retrospective dates are not exact arrival dates. The first Kutchi arrival in Kenya is not established.
4. Ethiopian migration is compared through its own political and Red Sea chronology. There is no unsupported Kenya-to-Ethiopia migration arrow or Kutchi population estimate.
5. The map's equal line widths do not represent numbers. Curves are selected connections, not historical sailing tracks or railway alignments. Mandvi sometimes stands for Kutch, and London for Britain; those substitutions are explicitly disclosed.
6. Regional commercial connections do not acquire migration arrows. Directed lines are limited to migration relationships described in the route ledger. Broader Indian and railway contexts are visually distinguished from Kutchi-specific evidence.
7. Changing references requires checking article, evidence table, route ledger and transcript together. Do not silently renumber one surface.

## Images

Only researched, openly reusable images are included. No image is an AI reconstruction or presented as a photograph of an undocumented migrant.

- Mandvi photograph: Camaal Mustafa Sikan… (display name as recorded by Wikimedia Commons), original upload 19 April 2008, CC BY 3.0. Original image retained; header applies a CSS display crop.
- Kilindini illustration: British Library digitisation from W. W. A. Fitz Gerald's 1898 book. Commons records the institution's no-known-copyright-restrictions release. Original retained.
- Harar photograph: Sailko, 8 November 2018, CC BY 3.0. Resized to 1500px wide and converted to WebP. It supplies architectural context; the caption does not identify its builder as Kutchi or confuse it with the shrine inscription discussed in the text.

The public article links to each file record and licence and records the transformations. Do not substitute another image without checking provenance, reuse rights and the accuracy of its caption.

## Verification

The reader flow is History index/category → server-rendered study → map period/animation → linked evidence → external source. The study and full map transcript are readable without JavaScript; the animated controls require it. Reduced-motion preference disables playback and preserves manual selection.

`tests/browser/history-diaspora.spec.ts` checks index/category discovery, author and canonical metadata, period controls and pause, keyboard activation, reduced motion, source anchors, image delivery, responsive overflow, runtime errors, and reading without JavaScript. Existing public-route and CMS-publication tests cover the surrounding archive.

Run `npm run typecheck`, `npm run lint`, `npm run build` and the relevant Playwright tests before publishing.

## Archival expansion, 22 October 2026

Three parallel research searches covered Kenya's coast, Kutch's maritime records and the Ethiopian/Horn network. The public bibliography grew from 24 to 33 entries; source 15 was upgraded from an institutional summary to the full article. New evidence was checked in the linked text or digitised scan, not accepted from catalogue titles alone.

| Reference | Locator | What changed |
| --- | --- | --- |
| 25, Burton and Speke 1858 | Printed p. 196, PDF page 10 | Explicit Cutch-origin official at Wasini in January 1857; distinct from household settlement. |
| 26, Salt | 1816 American edition, Appendix V, p. 450; Wikisource scan page 458 | March 1810 Zeila return names Cutch cloth. Its quantities cover three years, not one. First publication was 1814, but pagination follows the consulted 1816 edition. |
| 27, Leech | Report submitted May 1837, printed 1855; p. 215 / PDF 258 | Named vessels and annual Mandvi–Zanzibar trade. The same compilation's pp. 310–311 / PDF 353–354 reproduce the 6 February 1836 slave-import prohibition. |
| 28, Cooper and Rajani 2026 | RGS mr Asia S.4; manuscript, acquisition and dating sections | A surviving Kachchhi-Gujarati chart securely acquired in 1835; estimated manufacture date remains qualified. No archival photograph reused without separate rights assessment. |
| 29, Salvadori 2009 | Printed p. 37 / PDF 38 | The Jusub Adam / 1705 assertion is labelled an independently unverified lead, not plotted or adopted as a founding date. |
| 30, voyage journal | Ravenstein edition 1898, pp. 40, 44–45, notes 124 and 130; editorial p. 181 | Indian vessels at Malindi in 1498, not demonstrated Kutchi settlers in Mombasa. |
| 31, Burnes 1836 | Printed pp. 26–27 / PDF 5–6 | Original account of the Veerasil's early 1835 Mandvi–Arabia–Berbera voyage, obtained from its crew and pilot. Burnes accompanied only the Bombay–Kutch passage. |
| 32, Owen 1833 | Vol. II, pp. 150–151, 155, 157 | Indian commercial presence during the early British intervention, without demonstrated Kutchi identification. |
| 33, Burton | First published 1856; consulted 1894 Memorial Edition, vol. II, p. 24 / PDF 46 | Cutch canvas used for Harar gate duties in 1855; material circulation, not household ancestry. Searchable text: https://www.gutenberg.org/cache/epub/6886/pg6886-images.html. |
| 15, Harre 2015 | Printed pp. 286–290 | Sidhpur origins of both merchants; approximate 1885 departure and 1893/early 1894 Harar arrival from distinct retrospective sources. Do not infer an 1886 personal arrival from the title. |

Further leads, not verified original holdings: Emery's journal (UK National Archives ADM 52/3940), correspondence with W. D. Cooley in the RGS Emery manuscript file, and the Bombay/Maharashtra State Archives correspondence cited by Ibrahim. These belong in a future retrieval plan, not the public chronology as established findings. A 1901 Mombasa probate notice naming Cutch Mandvi was discoverable in search, but its source scan could not be retrieved; it was not added as independently inspected evidence.
