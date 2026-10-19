export type Field = { key: string; label: string; type?: "text" | "textarea" | "select"; options?: string[]; help?: string; required?: boolean };
export type ResourceConfig = { title: string; singular: string; api: string; label: string; fields: Field[]; publicPath?: (row: Record<string, unknown>) => string };

export const resources: Record<string, ResourceConfig> = {
  "family-members": { title: "Family members", singular: "Family member", api: "members", label: "preferred_name", fields: [
    {key:"preferred_name",label:"Preferred name",required:true}, {key:"birth_date_text",label:"Birth date or approximate period",help:"Leave blank when unknown; do not invent a day."}, {key:"death_date_text",label:"Death date or approximate period"}, {key:"living_status",label:"Living status",type:"select",options:["unknown","living","deceased"]}, {key:"birthplace",label:"Birthplace"}, {key:"short_bio",label:"Short biography",type:"textarea"}, {key:"biography",label:"Extended biography",type:"textarea"}, {key:"private_notes",label:"Private editorial notes",type:"textarea"}, {key:"visibility",label:"Visibility",type:"select",options:["private","family","public"]}
  ] },
  dictionary: { title: "Dictionary", singular: "Dictionary entry", api: "lexemes", label: "headword", publicPath: row => `/dictionary/${row.id}`, fields: [
    {key:"headword",label:"Headword",required:true,help:"Preserve apostrophes and (n) exactly."}, {key:"part_of_speech",label:"Part of speech"}, {key:"usage_note",label:"Usage notes",type:"textarea"}, {key:"etymology_note",label:"Etymology or borrowing notes",type:"textarea"}
  ] },
  history: { title: "History and culture", singular: "Article", api: "articles", label: "title", publicPath: row => `/history/${row.slug}`, fields: [
    {key:"title",label:"Title",required:true}, {key:"slug",label:"Permanent URL slug",required:true,help:"Lowercase letters, digits, and hyphens."}, {key:"summary",label:"Summary",type:"textarea"}, {key:"body_markdown",label:"Article body (Markdown)",type:"textarea",help:"Use Markdown headings, quotations, and links. Raw HTML is not rendered."}
  ] },
  orthography: { title: "Orthography", singular: "Orthography version", api: "orthography", label: "title", fields: [
    {key:"label",label:"Version",required:true}, {key:"title",label:"Page title",required:true}, {key:"body_markdown",label:"Working rules (Markdown)",type:"textarea",required:true}
  ] },
  categories: { title: "Categories", singular: "Category", api: "categories", label: "title", fields: [
    {key:"title",label:"Title",required:true}, {key:"slug",label:"Slug",required:true}, {key:"description",label:"Description",type:"textarea"}
  ] },
  sources: { title: "Sources", singular: "Source", api: "sources", label: "title", fields: [
    {key:"title",label:"Title",required:true}, {key:"citation",label:"Citation",type:"textarea"}, {key:"url",label:"URL"}, {key:"notes",label:"Private notes",type:"textarea"}
  ] },
};

export const navigation = [
  {href:"/admin",label:"Overview"}, {href:"/admin/family-members",label:"Family members"}, {href:"/admin/family-relationships",label:"Family relationships"}, {href:"/admin/dictionary",label:"Dictionary"}, {href:"/admin/history",label:"History and culture"}, {href:"/admin/media",label:"Media library"}, {href:"/admin/drafts",label:"Drafts and publishing"}, {href:"/admin/settings",label:"Settings"},
];
