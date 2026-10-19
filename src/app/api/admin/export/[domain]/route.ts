import { getAdmin } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'

const domains = {
  family: {
    family_members: 'id', member_names: 'id', family_relationships: 'id',
    member_media: 'member_id', member_sources: 'member_id',
    media_assets: 'id', sources: 'id',
  },
  dictionary: {
    lexemes: 'id', word_forms: 'id', senses: 'id', examples: 'id',
    orthography_versions: 'id', lexeme_media: 'lexeme_id',
    example_media: 'example_id', related_lexemes: 'lexeme_id',
    lexeme_sources: 'lexeme_id', media_assets: 'id', sources: 'id',
  },
} as const
const secondaryOrder: Record<string, string> = {
  member_media: 'media_id', member_sources: 'source_id',
  lexeme_media: 'media_id', example_media: 'media_id',
  related_lexemes: 'related_lexeme_id', lexeme_sources: 'source_id',
}

export async function GET(_request: Request, context: { params: Promise<{ domain: string }> }) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { domain } = await context.params
  if (domain !== 'family' && domain !== 'dictionary') return error('Not found', 404)
  const data: Record<string, unknown[]> = {}
  for (const [table, order] of Object.entries(domains[domain])) {
    const rows: unknown[] = []
    for (let offset = 0; ; offset += 500) {
      let query = admin.supabase.from(table).select('*').order(order)
      if (secondaryOrder[table]) query = query.order(secondaryOrder[table])
      const { data: page, error: dbError } = await query.range(offset,offset+499)
      if (dbError) return error(`Unable to export ${table}`, 500)
      rows.push(...(page || []))
      if (!page || page.length < 500) break
    }
    data[table] = rows
  }
  return Response.json({ format: 'kutchi-roots-export', version: 1, domain,
    exported_at: new Date().toISOString(), data }, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="kutchi-roots-${domain}.json"`,
    },
  })
}
