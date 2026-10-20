import { z } from 'zod'
import { safeExternalUrl } from '@/lib/safe-external-url'

const uuid = z.string().uuid()
const short = z.string().trim().min(1).max(300)
const note = z.string().max(20000).nullable().optional()
const status = z.enum(['draft', 'review', 'published', 'archived'])
const version = z.number().int().positive()

export const createSchemas = {
  members: z.object({
    preferred_name: short,
    birth_date_text: z.string().max(100).nullable().optional(),
    death_date_text: z.string().max(100).nullable().optional(),
    living_status: z.enum(['unknown','living','deceased']).optional(),
    birthplace: z.string().max(300).nullable().optional(),
    places_lived: z.array(z.string().max(300)).max(30).optional(),
    short_bio: note, biography: note, private_notes: note,
    portrait_media_id: uuid.nullable().optional(),
    visibility: z.enum(['private','family','public']).optional(),
    status: status.optional(),
  }).strict(),
  relationships: z.object({
    person_a_id: uuid, person_b_id: uuid,
    kind: z.enum(['parent','partner']),
    parent_kind: z.enum(['biological','adoptive','unknown']).nullable().optional(),
    confidence: z.enum(['confirmed','uncertain','disputed']).optional(),
    note, status: status.optional(),
  }).strict().superRefine((v, ctx) => {
    if (v.person_a_id === v.person_b_id) ctx.addIssue({ code: 'custom', message: 'A person cannot be related to themself' })
    if (v.kind === 'parent' && !v.parent_kind) ctx.addIssue({ code: 'custom', message: 'Parent relationship type is required' })
    if (v.kind === 'partner' && v.parent_kind) ctx.addIssue({ code: 'custom', message: 'Partners cannot have a parent relationship type' })
  }),
  lexemes: z.object({
    headword: short, part_of_speech: z.string().max(100).nullable().optional(),
    morphology_note: note, linguistic_tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
    usage_note: note, etymology_note: note,
    orthography_version_id: uuid.nullable().optional(), status: status.optional(),
  }).strict(),
  spellings: z.object({ lexeme_id: uuid, spelling: short, is_preferred: z.boolean().optional(), note }).strict(),
  senses: z.object({ lexeme_id: uuid, gloss_en: short, definition_en: note, display_order: z.number().int().min(0).optional() }).strict(),
  examples: z.object({ sense_id: uuid, kutchi_text: z.string().trim().min(1).max(2000), english_translation: z.string().max(2000).nullable().optional(), note, display_order: z.number().int().min(0).optional() }).strict(),
  articles: z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(200), title: short, summary: note, body_markdown: z.string().max(200000).optional(), status: status.optional(), published_at: z.string().datetime().nullable().optional() }).strict(),
  categories: z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(100), title: short, description: note, display_order: z.number().int().min(0).optional() }).strict(),
  orthography: z.object({ label: short, title: short, body_markdown: z.string().max(200000), status: status.optional() }).strict(),
  sources: z.object({ title: short, citation: note,
    url: z.string().max(2000).refine(value => safeExternalUrl(value) !== null, 'Use an http or https URL without embedded credentials').nullable().optional(),
    notes: note }).strict(),
} as const

export const patchSchemas = {
  members: createSchemas.members.partial().extend({ version }),
  relationships: z.object({
    person_a_id: uuid.optional(), person_b_id: uuid.optional(),
    kind: z.enum(['parent','partner']).optional(),
    parent_kind: z.enum(['biological','adoptive','unknown']).nullable().optional(),
    confidence: z.enum(['confirmed','uncertain','disputed']).optional(), note,
    status: status.optional(), version,
  }).strict(),
  lexemes: createSchemas.lexemes.partial().extend({ version }),
  spellings: createSchemas.spellings.partial().extend({ version: version.optional() }),
  senses: createSchemas.senses.partial().extend({ version: version.optional() }),
  examples: createSchemas.examples.partial().extend({ version: version.optional() }),
  articles: createSchemas.articles.partial().extend({ version }),
  categories: createSchemas.categories.partial().extend({ version: version.optional() }),
  orthography: createSchemas.orthography.partial().extend({ version }),
  sources: createSchemas.sources.partial().extend({ version: version.optional() }),
} as const

export const resourceTables = {
  members: 'family_members', relationships: 'family_relationships',
  lexemes: 'lexemes', spellings: 'word_forms', senses: 'senses',
  examples: 'examples', articles: 'articles', categories: 'categories',
  orthography: 'orthography_versions', sources: 'sources',
} as const
export type Resource = keyof typeof resourceTables
export const hasVersion = new Set<Resource>(['members','relationships','lexemes','articles','orthography'])

export function isResource(value: string): value is Resource {
  return Object.hasOwn(resourceTables, value)
}
