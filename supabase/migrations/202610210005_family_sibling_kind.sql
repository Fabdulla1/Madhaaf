-- Run this in its own committed migration before constraints reference the new enum value.
alter type public.relationship_kind add value if not exists 'sibling';
