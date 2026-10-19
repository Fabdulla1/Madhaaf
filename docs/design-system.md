# Kutchi Roots — product design system

Status: implementation guidance for the first release. The cultural content and family records in the product must come from the administrator or documented sources; this document does not establish any historical or linguistic fact.

## Product principles

1. **An archive that invites exploration.** Public pages should feel editorial, calm, and human. Use generous margins, restrained borders, and direct explanations of what a visitor can discover.
2. **Trust before decoration.** Mark unpublished, private, uncertain, and provisional information plainly. Never use a real-looking person, recording, quotation, historical claim, or Kutchi expression as filler.
3. **One clear next step.** Each page has a primary action. Supporting actions stay visible but secondary. Do not hide core interactions behind hover.
4. **Privacy is visible.** The family tree begins private. Public invitations can explain the family space without names, silhouettes of actual records, counts, thumbnails, or relationship details.
5. **Editing is a careful act.** The dashboard gives accurate save and publication states, clear source and consent fields, revision context, and a chance to correct mistakes.

## Visual language

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F7F3EA` | Public page ground |
| Paper | `#FFFCF6` | Reading surfaces, form panels |
| Ink | `#163E3A` | Primary text, headings, strong controls |
| Ink muted | `#4F625F` | Secondary text; verify contrast at final font size |
| Ocean | `#235D56` | Primary interactive surfaces |
| Ocean hover | `#194A44` | Hover and pressed surfaces |
| Terracotta | `#B7674E` | Decorative rules, large accents, highlights |
| Terracotta ink | `#873E2B` | Small links or text on light backgrounds |
| Line | `#D8D3C8` | Dividers and input borders |
| Focus | `#135EAA` | Keyboard focus ring, with light offset |
| Danger | `#9A2E2E` | Errors and destructive actions |
| Success | `#256B45` | Confirmed state |

Use color with text or shape for status. Terracotta on ivory is an accent, not the default small-text color. Reserve solid dark teal for prominent calls to action and key navigation. Avoid shadows on routine content; use borders and spacing to group it.

### Type and rhythm

- Use an elegant serif for page titles, article titles, and selected editorial callouts. Use a legible sans-serif for body copy, navigation, labels, controls, tables, and dictionary notation. A local or hosted font must have a robust fallback; layout should remain stable while it loads.
- Desktop display: `clamp(2.75rem, 5vw, 5rem)` with compact line height. Page titles: `clamp(2.25rem, 4vw, 3.75rem)`. Section titles: `clamp(1.75rem, 2.5vw, 2.5rem)`. Body: at least `1rem`, `1.55–1.7` line height. Fine print: at least `0.875rem`.
- Use a consistent spacing scale based on 4 px. Default control height at least 44 px; primary buttons about 48 px. Public sections can use 72–112 px vertical spacing on desktop and 48–72 px on mobile.
- Keep reading columns around 65–75 characters and broad layouts within roughly 1200–1280 px. Wider tree canvas is intentional. Use restrained radii: 4–8 px on inputs/panels, pills only for compact tags or statuses.
- Do not stylize the apostrophe or `(n)` in Kutchi headwords in a way that changes their characters. Use fonts that clearly distinguish letters, punctuation, and numerals.

### Imagery and motion

- Use approved archival media with captions, attribution, consent/publication status, and useful alternative text. Until then, use typographic composition, color fields, or explicitly labeled illustrative placeholders. Do not present generated images as documentary evidence.
- Avoid decorative cultural symbols unless their meaning and use are sourced and appropriate.
- Motion helps orientation: subtle 150–250 ms transitions for panels and selection, smooth but interruptible tree centering. Respect `prefers-reduced-motion`; never require motion to understand a state change.

## Navigation and page journeys

### Global public shell

Desktop header: wordmark at left; Home, Family Tree, Dictionary, History in a quiet horizontal row; Login or Dashboard as the distinct rightmost link. The active destination has a persistent text or underline cue. Mobile header: wordmark, a labeled menu button, and a full-width menu with visible close control. Footer: concise project description, core links, orthography reference, and a path to contact/contribute when that path is real. Breadcrumbs appear on entry, profile, and article pages.

### Homepage

Journey: arrive → understand the project → search a word or choose an archive area → explore a published entry/story or request access to the private family space.

1. Hero: exact headline **“Our people. Our words. Our story.”** A short, factual project introduction and two actions: explore dictionary and explore history. The visual treatment can evoke an archive through type, line work, and approved imagery; it must not depict invented genealogy.
2. Introduction: explain the Mombasa Kutchi focus and the evolving nature of the archive without implying formal linguistic recognition.
3. Dictionary search: visible input and submit button. An example preview may use only the six user-provided entries and must link to a published entry if one exists. If no public entry exists, explain that the dictionary is being prepared.
4. Family invitation: explain that family records are private and that authorized users can sign in. No private counts or portraits.
5. History: category entry points and published stories. If none exist, use a well-designed empty state with no fabricated teaser.
6. Contribution invitation: explain what materials or knowledge may eventually be contributed and link only to a working contact channel or a clear information page.

### Dictionary list and entry

Journey: enter exact Kutchi spelling or English meaning → inspect ranked results → open stable entry URL → read senses/examples → play attributed audio when available → follow related published entries.

- Search is the first visual focus. Preserve apostrophes and parentheses in display and exact matching. If approximate matches exist, label them **“Possible matches”** after exact results; never silently merge distinct forms.
- Provide alphabetical browse and a short explanation of the draft orthography. Use clear empty, no-result, loading, and error states. No-result copy should repeat the query safely and offer a spelling tip without implying that markers can be ignored.
- Entry page: headword; pronunciation control only when audio exists; spelling variants; concise meanings; parts of speech when documented; examples with translations and recordings; usage and source information; related words; orthography version. Omit absent fields rather than showing a wall of empty placeholders.
- The “How We Write Mombasa Kutchi” page shows **Draft 0.3** prominently, a compact rule table, and separate “current working conventions” and “questions still being studied” sections. Every rule remains editable through the dashboard.

### History and culture

Journey: scan topic overview → select a published article → read in an uncluttered column → inspect sources and approved media → move to related public material.

- Overview includes Diaspora, Mombasa community, Language and oral traditions, Food and cultural practices, and approved Family stories as editorial categories. A category with no published articles has an honest empty state.
- Article page uses a readable column with captioned media, pull quotes only when sourced, visible publication and update dates when available, and citations/source notes near the end. Links to family records appear only after audience authorization checks.

### Family tree and profile

Journey for an authorized user: open tree → locate a person with search or generation controls → center and inspect connections → open quick view → open full profile → return to preserved tree context.

- The tree is a large dedicated canvas with persistent Search, Zoom, Reset, Fit, and **List view** controls. Controls have labels and keyboard shortcuts only as optional supplements. The selected person and direct relationships must be visually and textually apparent.
- The quick view is a side panel on wide screens and a full-height sheet on small screens. It has the person's name, life period where known, concise biography, relationship list, and an Open full profile action. Closing it returns focus to the selected tree node.
- The list view is a fully functional alternative with person search, generation/branch grouping where data permits, and explicit relationship links. It must not depend on canvas position or drag gestures.
- Profiles start with a portrait or respectful initials placeholder, name variants, lifespan expressed at the available precision, biography, connections, media and memories, and sources. Clearly mark uncertain facts and relationship types. Avoid rendering unknown data as a dash-heavy form.
- For an unauthorized visitor, `/family` presents a plain privacy/access explanation and login route without loading private record data.

### Login

Journey: enter email/password → reveal password if desired → submit → see specific but safe feedback → reach dashboard; optional reset flow only when configured.

Use a compact, quiet composition connected to the public identity. Label fields above inputs. State the private nature of the family archive without implying public sign-up. Use a password visibility button with an accessible changing label. Preserve the entered email after failure. Never disclose whether a particular account exists. Provide an obvious return to the public site.

### Administrator dashboard

Journey: sign in → see current editorial work → choose a content type → create/edit → preview → publish → verify result on public or private surface.

- Desktop uses a persistent sidebar with Overview, Family Members, Family Relationships, Dictionary, History and Culture, Media Library, Drafts and Publishing, Settings. Tablet/mobile uses a labeled drawer or compact section navigation. Keep a visible account/logout control.
- Overview prioritizes recent edits, drafts, pending review, published records, and three quick actions. Show only real counts and events. A new installation gets a useful setup checklist and content-specific empty states.
- List pages share search/filter/status, result count, sortable fields where useful, clear create action, and row actions with labels. They should work at mobile widths as stacked rows rather than squeezed tables.
- Edit pages share a top title and persistent status, clear sections, source/consent/visibility fields where relevant, and an action bar: Save draft, Preview, Publish or Update, and More (unpublish/archive). A destructive action has a confirmation dialog describing impact.
- Show server-confirmed success and errors near the action and in a polite live region. Warn before leaving with unsaved changes. On edit conflict, show who/when changed the record if available and offer a safe refresh/compare path; do not silently overwrite.

### Domain-specific editor journeys

- **Family:** search for an existing person before creating one; profile sections separate identity/life period, biography, media, visibility, and sources. Relationship flow: choose relationship type → find or create the other person → add certainty, dates, and sources where known → preview both sides → save. Explain validation errors near the relevant step. A draft person and relationship should not accidentally become publicly visible.
- **Dictionary:** headword and preferred spelling first; repeatable meaning, variant, and example groups; pronunciation/example audio with speaker, consent, and attribution; visible orthography version and publication state. A spelling change retains the stable link. Make `ku'la` and `(n)` easy to type and display without automatic punctuation substitution.
- **History:** title/slug/summary, structured body, media with caption and source, categories, citations, preview, publication state. Autosave is optional; if absent, never imply it exists. Preview uses the real article rendering while clearly marking draft state.
- **Media:** upload validation before submission; show file type, size, access level, consent, attribution, usage, and processing status. Private family media is visibly distinct from publishable public media.

## Responsive behavior

| Width | Layout and interaction |
| --- | --- |
| `< 640px` | Single-column reading layout; 16–20 px side padding; mobile menu/drawer; stacked admin results; full-screen profile sheet; tree tools in a compact labeled rail or toolbar; list view easily reachable. No horizontal page scroll. |
| `640–1023px` | More generous single/two-column editorial layouts; dashboard drawer or narrow rail; tree canvas plus collapsible quick view. Touch remains a first-class input. |
| `>= 1024px` | Full navigation, broad editorial sections, fixed dashboard sidebar, tree canvas with adjacent quick-view panel. Reading copy still obeys the narrower measure. |

On touch devices, canvas pan must not trap page scrolling; make the tree's gesture expectations clear and keep a one-tap path to list view. Inputs and buttons should have at least 24×24 px target area and preferably 44×44 px for primary touch controls. Verify at 320, 375, 768, 1024, and 1440 px, including zoomed text at 200%.

## Accessibility requirements

- Target WCAG 2.2 AA. Use semantic landmarks, ordered headings, descriptive page titles, language declaration, skip link, and visible breadcrumbs where depth requires them.
- Maintain 4.5:1 contrast for normal text and 3:1 for large text and meaningful UI graphics. Test final font/color combinations; token values alone do not prove conformance.
- All navigation, dialogs, menus, forms, audio controls, quick views, and list-view relationships must work with keyboard and screen reader. Use visible focus, logical tab order, focus return on dismissal, and Escape where expected.
- Forms need persistent labels, instructions before fields, inline error text linked with `aria-describedby`, an error summary on multi-field failures, and status announcements for save/publish results. Never rely on color alone.
- Provide an accessible text/list alternative to the tree with equivalent person and relationship discovery. Canvas nodes require meaningful labels and selection/focus state. Zoom must not be the only path to information.
- Audio controls need accessible labels, duration when known, and transcripts/translated text for spoken content where possible. Missing transcripts should be an explicit editorial state.
- Support reduced motion and 200% text zoom. No content or controls may disappear because of enlarged text. Do not auto-play audio.

## Shared states and copy rules

Every data surface needs loading, empty, no-results, failure, success, and access-denied states as relevant. Each state says what happened and offers a useful next step. Use direct copy: “No published articles yet” or “This family space is private.” Do not claim records, contributors, recordings, or sources that do not exist.

Use status labels consistently: **Draft**, **In review**, **Published**, **Archived**, **Private**, and **Uncertain** only where the underlying model supports them. Do not use “Saved” until the server confirms it. Distinguish an unavailable action from one that is processing. Any skeleton should match the eventual content shape and avoid flashing for brief loads.

## Rendered-page critique checklist

After a working implementation, review actual desktop, tablet, and mobile renders of the homepage, dictionary list/entry, orthography page, history overview/article, tree/list/profile, login, dashboard, and each editor. Record each finding with page, viewport, reproducible action, severity, expected behavior, screenshot, and proposed fix. Check hierarchy, readability, spacing, contrast, content authenticity, responsive overflow, touch/keyboard use, empty and error states, tree orientation, form completion, and publication feedback. Revisit each finding after a fix and retain evidence of the resolved state.
