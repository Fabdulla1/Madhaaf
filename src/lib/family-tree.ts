export function relationshipsForTree<T extends { status: string }>(relationships: T[], publicView: boolean): T[] {
  return relationships.filter(relationship =>
    relationship.status !== "archived" && (!publicView || relationship.status === "published")
  );
}
