import dagre from "@dagrejs/dagre";

export function relationshipsForTree<T extends { status: string }>(relationships: T[], publicView: boolean): T[] {
  return relationships.filter(relationship =>
    relationship.status !== "archived" && (!publicView || relationship.status === "published")
  );
}

export function familyTreePositions(
  memberIds: string[],
  relationships: { person_a_id: string; person_b_id: string; kind: string }[],
  nodeSize: { width: number; height: number },
): Map<string, { x: number; y: number }> {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: "TB", nodesep: 72, ranksep: 112, marginx: 55, marginy: 55 });
  graph.setDefaultEdgeLabel(() => ({}));
  const allowed = new Set(memberIds);
  for (const id of memberIds) graph.setNode(id, { ...nodeSize });

  // A partner edge can form a rank cycle when both partners parent the same child.
  // Place generations using parent links; the canvas still draws partner links.
  for (const relationship of relationships) {
    if (relationship.kind === "parent" && allowed.has(relationship.person_a_id) && allowed.has(relationship.person_b_id)) {
      graph.setEdge(relationship.person_a_id, relationship.person_b_id);
    }
  }
  dagre.layout(graph);
  return new Map(memberIds.map(id => [id, graph.node(id)]));
}
