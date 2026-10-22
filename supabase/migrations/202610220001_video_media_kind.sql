-- Commit this migration before using the new enum value in constraints.
alter type public.media_kind add value if not exists 'video';
