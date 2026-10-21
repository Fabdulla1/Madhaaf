# Codex handoff — add speaker-attested la, jo, and negation to the Madhaaf dictionary

## Goal

Implement the next **dictionary** expansion for `Fabdulla1/Madhaaf` using the native-speaker evidence already published in:

- `src/lib/language-articles-october-2026.ts`
- `/language/articles/la-and-jo-beneficiary-and-possession`
- `/language/articles/how-negation-works-in-my-kutchi`

Do not rewrite those papers or treat hypothetical linguistic interpretations as verified facts. The grammar articles can precede database entries: this task is to make the linked dictionary searches useful.

Source: Farhan Abdulla, native speaker of East African Mombasa Kutchi; personal translation, grammaticality and comparison studies collected in October 2026 (Studies 008–011). Keep original spelling and the supplied English readings. **An unanswered question is not negative evidence.**

## Phase 1 — Inspect before modifying anything

Inspect the schema, publish/unpublish immutability guards, and dictionary search behavior, including:

- `supabase/migrations/202610200001_dictionary_linguistics.sql`
- `supabase/migrations/202610210001_dictionary_attestations.sql`
- `supabase/migrations/202610210002_dictionary_example_provenance.sql`
- `supabase/migrations/202610210003_published_example_sources.sql`
- `src/app/api/dictionary/route.ts`
- `src/app/api/dictionary/[id]/route.ts`
- `scripts/import_kutchi_linguistic_evidence.py`
- `scripts/import_kutchi_word_list_additions.py`
- `scripts/import_kutchi_followup_words.py`
- existing data import manifests and tests

Read the live dictionary in a nonmutating mode using the securely configured database connection (if authorized). Inventory `lexemes`, `senses`, `word_forms`, `inflected_forms`, `sources`, `lexeme_sources`, `examples`, and `example_lexemes` for exact heads, homographs and spelling variants. In particular, identify whether `la` and `jo` already exist. Do not duplicate a previously imported lexeme and do not merge a homograph because of spelling alone. Do not expose credentials or copy a production `.env.local` into commits or logs.

## Phase 2 — Highest-priority items

**la**: Native-speaker-attested `Hin la au(n) pe(n)sa kayose` means “I picked up money for him.” Treat this as a beneficiary-related “for” use. The speaker also supplied `khadho la au(n) kana(n)tho` (“for the food, I am taking it”) and accepted both `khadho la` and `khade la` for “for the food.” Document a second food-related “for” usage without asserting that all benefactive, purpose and exchange functions are interchangeable. A broad POS such as adposition/postposition is a **provisional grammatical analysis** unless the entry model already has a more suitable category.

**jo**: Native-speaker-attested `Hin jo pe(n)sa au(n) kayose` means “I picked up his money.” `Hee mujo bhaa jo ghar ai` means “This is my brother's house.” These support a possessive/genitive-like use of jo in these constructions. **Do not overwrite or delete the previously listed gloss “for”** for jo; that older gloss has not yet been disconfirmed. Inspect whether the existing jo lexeme should have an additional sense or there is sufficient evidence for an independent homograph. Distinguish the independently attested `Hinjo ghar` (“His house”) and spaced `Hin jo pe(n)sa`; their equivalence or morphology is still unresolved. Never silently normalize `hinjo` to `hin jo`.

**khade / khadho**: The speaker accepts both before la and no mandatory `khadho → khade` rule is established. Preserve the exact original forms. Whether `khade` is a separate headword, a morphological form, or a spelling variant should remain provisional; review existing lexemes and speaker notes before linking it.

**ke**: If updating relevant entries, preserve the earlier recipient/object/experiencer evidence. Do **not** fold `ke`, `la`, and `jo` into one sense. The speaker's examples distinguish a recipient of given food, a beneficiary of picking up money, and an owner of money.

## Phase 3 — Negation evidence to attach to existing entries / paradigms

Record the **attested constructions**, not an invented universal negative paradigm:

| Exact speaker form | Speaker-provided meaning / context |
| --- | --- |
| `Natho sume` | He is not sleeping. |
| `Nathi sume` | She is not sleeping. |
| `Hee mukhe pe(n)sa natho dye` | He doesn't give me money. |
| `Hee mukhe pe(n)sa nai dhine` | He didn't give me money. |
| `Paa(n) kaal na oosyasee` | We did not go yesterday. |
| `Nah sum!` | Don't sleep! |
| `Nah vin` | Don't go! |
| `Nah kar` | Don't do it! |
| `Nah vendhose` | I will not go (previous future-negative context). |
| `Mukhe kheno ai, pun khadho nai` | I want to eat, but there is no food. |
| `Natho kanaa(n) se mujo bapa mukhe raja nai dhine` | I am not taking it because my father has not allowed me to do so. |
| `paani mukhe natho kape` | I don't want water. |
| `paani hin ke natho kape` | He doesn't want water. |
| `Mukhe hinee cheejeu(n) nathaa kape(n)` | I don't want these things. |

**Ambiguity gate:** These *full forms* were supplied in answer to a female-giver, present/past negative elicitation, but the giver and recipient were **not separately disambiguated**. Do not invent English translations or assign an agreement controller:

- `Hin ke au(n) pe(n)sa nai dhineese` — past-negative elicitation
- `hin ke au(n) pe(n)sa nathi dhya(n)` — present-negative elicitation

Where source schema requires an English translation, store such forms as elicitation/morphology notes pending speaker clarification rather than fabricating one. The presence of `hin ke` plus `au(n)` is a live syntactic question. Likewise, `nathaa` occurs with a plural desired item, but the agreement controller is not proven.

Do not claim `nai` is exclusively past: it also occurs with “there is no food.” Do not claim `nah` is exclusively imperative: a future-negative example is recorded. The future, negative and feminine suffix inventories are not proven.

Review and enrich existing lexemes for `natho`, `nathi`, `nathaa`, `na`, `nah`, `nai`, the imperative `de` and attested giving forms `dye`, `dhine`, `dhya(n)`, `dhineese`, `dhinose` where appropriate. Review `kan`/`kayose` (took / picked up), `khadho`/`khade`, `pe(n)sa`, `mukhe`, `hin`, `hinjo`, `mujo`, `bhaa`, `raja` and `bapa` without inventing new senses. Do not conflate `raja` meaning permission/approval with similar spellings glossed “king.”

## Phase 4 — Provenance, safe import and publication

Produce an auditable structured evidence manifest (e.g., `data/kutchi-la-jo-negation-evidence-20261021.json`) with exact Kutchi and English content, source title, speaker attribution, attested/provisional status, and notes for unresolved morphology and speaker judgments.

- Draft a deterministic idempotent **dry-run-first** import, using the existing importer patterns and relevant constraints.
- Show existing vs proposed records, spelling collisions, ambiguous homographs, and number of records added/updated before applying.
- Preserve existing IDs, glosses, publication statuses, linked examples and source records. Do not overwrite approved entries.
- Use source IDs and the existing published-source mechanism; associate attested sentences with relevant lexemes through the established cross-link model rather than duplicating all evidence under every headword.
- Honor immutable-published-entry triggers, transaction/rollback requirements, RLS and duplicate-review semantics. Don't bypass these safeguards.
- Run a rehearsal in rollback-only mode; take a complete backup **outside the repository** before any authorized production apply.
- Do not create a new schema migration if the current data model already supports this evidence.
- If DB credentials or safe execution access are unavailable, commit and test the import tooling, then report exactly what is blocked; never claim the dictionary was updated.

## Phase 5 — Verification and deliverables

Test duplicate-safe reruns, public dictionary search for `la` and `jo`, preservation of the original jo “for” gloss, exposure of additional possessive sense, and searches for recorded negative forms. Verify private/unpublished entries remain inaccessible and existing dictionary pages and inflections work.

Run lint, typecheck, build, relevant Python/SQL/browser tests and GitHub CI; check Vercel if site behavior changed. Use a feature branch, focused commits, PR review, and resolve findings before merge. Provide a report with added/enriched entries, exemplar sentences, evidence status, source links, migration/production apply status, test results, conflicts and open linguistic questions.

**Success condition:** The dictionary records the attested la-versus-jo contrast and negative constructions, retains earlier non-conflicting information, supports the site's dictionary links, and does not advertise unverified grammatical inferences as speaker-confirmed facts.
