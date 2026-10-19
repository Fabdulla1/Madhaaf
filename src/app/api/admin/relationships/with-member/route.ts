import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { createSchemas } from '@/lib/server/schemas'

const schema = z.object({
  member: createSchemas.members,
  relationship: z.object({
    person_a_id: z.string().uuid().optional(),
    person_b_id: z.string().uuid().optional(),
    kind: z.enum(['parent','partner']),
    parent_kind: z.enum(['biological','adoptive','unknown']).nullable().optional(),
    confidence: z.enum(['confirmed','uncertain','disputed']).optional(),
    note: z.string().max(20000).nullable().optional(),
    status: z.enum(['draft','review','published','archived']).optional(),
  }).strict(),
  newMemberSide: z.enum(['a','b']),
}).strict()

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const args = await parseJson(request, schema)
    const r = args.relationship
    const existingId = args.newMemberSide === 'a' ? r.person_b_id : r.person_a_id
    const otherId = args.newMemberSide === 'a' ? r.person_a_id : r.person_b_id
    if (!existingId || otherId) return error('Provide exactly one existing member on the opposite side')
    if (r.kind === 'parent' && !r.parent_kind) return error('Parent relationship type is required')
    if (r.kind === 'partner' && r.parent_kind) return error('Partners cannot have a parent relationship type')
    const { data, error: dbError } = await admin.supabase.rpc('create_connected_member', {
      new_member: args.member,
      existing_member_id: existingId,
      new_member_side: args.newMemberSide,
      relationship_kind: r.kind,
      parentage: r.parent_kind || null,
      relationship_confidence: r.confidence || 'uncertain',
      relationship_note: r.note || null,
      relationship_status: r.status || 'draft',
    })
    if (dbError) return error(dbError.message, 400)
    return json(data, 201)
  } catch (cause) { return requestError(cause) }
}
