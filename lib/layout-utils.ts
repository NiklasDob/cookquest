import dagre from 'dagre';
import { Edge, Node } from '@xyflow/react';
import { QuestNodeData } from '@/components/QuestNode'; // Adjust path if needed

const nodeWidth = 140; // Approx width of your custom node (128px + padding)
const nodeHeight = 140; // Approx height of your custom node

export const getLayoutedElements = (nodes: Node<QuestNodeData>[], edges: Edge[]): Node<QuestNodeData>[] => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 }); // TB = Top to Bottom
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });
};