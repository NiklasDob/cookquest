"use client"

import { useState, useCallback, useEffect } from "react"
import Dagre from '@dagrejs/dagre';
import  {
  ReactFlow,
  Background,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { Lock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LessonScreen } from "@/components/lesson-screen"
import { RewardPopup } from "@/components/reward-popup"
import QuestNodeComponent, { QuestNodeData } from "./quest-node"

// --- The Quest interface is simpler (no position) ---
interface Quest {
  id: number
  title: string
  type: "lesson" | "challenge" | "boss" | "concept"
  category: "foundation" | "technique" | "flavor" | "cuisine" | "advanced"
  cuisineType?: "french" | "asian" | "italian"
  status: "locked" | "available" | "completed"
  stars: number
  maxStars: 3
  prerequisites: number[]
}

// --- Your original game data, but WITHOUT the `position` property ---
const initialQuestNodes: Quest[] = [
  // Foundation Skills
  { id: 1, title: "Knife Safety", type: "lesson", category: "foundation", status: "completed", stars: 3, maxStars: 3, prerequisites: [] },
  { id: 2, title: "Basic Cuts", type: "lesson", category: "foundation", status: "available", stars: 0, maxStars: 3, prerequisites: [1] },
  { id: 3, title: "Measuring", type: "lesson", category: "foundation", status: "locked", stars: 0, maxStars: 3, prerequisites: [1] },
  // ... PASTE THE REST OF YOUR NODES HERE, making sure to REMOVE the `position` property from all of them
  { id: 4, title: "Salt & Seasoning", type: "concept", category: "flavor", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
  { id: 7, title: "Heat Control", type: "lesson", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
  { id: 10, title: "Simple Soup", type: "challenge", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
  { id: 11, title: "GREATNESS", type: "lesson", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [10, 3] },
  // { id: 10, title: "Simple Soup", type: "challenge", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
];

const nodeTypes = {
  questNode: QuestNodeComponent,
};

// --- Dagre Layouting Function (based on the official example) ---
const getLayoutedElements = (nodes: Node<QuestNodeData>[], edges: Edge[], direction: 'TB' | 'LR') => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    // Use a fixed size for now, since custom nodes might not report dimensions correctly on the first pass
    g.setNode(node.id, { ...node, width: 128, height: 128 });
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);
      // We are shifting the node position (anchor=center) to the top left
      // so it matches the React Flow anchor point (top left).
      return { ...node, position: { x: x - 128 / 2, y: y - 128 / 2 } };
    }),
    edges,
  };
};


// --- The Main Component that handles the Flow logic ---
const QuestFlow = () => {
  // Your original game logic state remains
  const [questData, setQuestData] = useState<Quest[]>(initialQuestNodes)
  const [selectedLesson, setSelectedLesson] = useState<Quest | null>(null)
  const [showReward, setShowReward] = useState(false)

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<QuestNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const handleNodeClick = (nodeData: Quest) => {
    if (nodeData.status !== "locked") {
      setSelectedLesson(nodeData)
    }
  }

  // This effect synchronizes your game data (questData) with React Flow's nodes and edges
  useEffect(() => {
    // Create nodes with placeholder positions
    const unpositionedNodes: Node<QuestNodeData>[] = questData.map((quest) => ({
      id: quest.id.toString(),
      type: "questNode",
      position: { x: 0, y: 0 },
      data: { ...quest, onClick: handleNodeClick },
    }));

    const visibleEdges: Edge[] = [];
    questData.forEach((targetQuest) => {
      targetQuest.prerequisites.forEach((prereqId) => {
        const sourceNode = questData.find((n) => n.id === prereqId);
        if (sourceNode && sourceNode.status === 'completed') {
          const isTargetAvailable = targetQuest.status === 'available';
          const isTargetCompleted = targetQuest.status === 'completed';
          visibleEdges.push({
            id: `e-${prereqId}-${targetQuest.id}`,
            source: prereqId.toString(),
            target: targetQuest.id.toString(),
            type: "smoothstep",
            animated: isTargetAvailable,
            style: { strokeWidth: 2, stroke: isTargetAvailable || isTargetCompleted ? 'var(--game-green)' : 'rgba(100, 116, 139, 0.4)', strokeDasharray: "6,4", opacity: isTargetAvailable || isTargetCompleted ? 0.8 : 0.5 },
          });
        }
      });
    });

    // Run the layout algorithm
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      unpositionedNodes,
      visibleEdges,
      'TB' // 'TB' for Top-to-Bottom
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // After the layout is set, fit the view
    window.requestAnimationFrame(() => {
      fitView();
    });

  }, [questData, setNodes, setEdges, fitView]); // Re-run whenever the source data changes

  
  const handleLessonComplete = () => {
    if (!selectedLesson) return;
    const updatedQuests = questData.map((node) => 
      node.id === selectedLesson.id ? { ...node, status: "completed" as const, stars: 3 } : node
    );
    const finalQuests = updatedQuests.map((node) => {
      if (node.status === "locked") {
        const allPrereqsCompleted = node.prerequisites.every((prereqId) => 
          updatedQuests.find((n) => n.id === prereqId)?.status === "completed"
        );
        if (allPrereqsCompleted) return { ...node, status: "available" as const };
      }
      return node;
    });

    setQuestData(finalQuests);
    setSelectedLesson(null);
    setShowReward(true);
  };


  if (selectedLesson) {
    return <LessonScreen lesson={selectedLesson} onComplete={handleLessonComplete} onBack={() => setSelectedLesson(null)} />;
  }

  // The main return wraps the ReactFlow component
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
      >
        <Background color="#4f4f4f" gap={24} variant={"dots"} />
      </ReactFlow>
      {showReward && <RewardPopup onClose={() => setShowReward(false)} />}
    </div>
  );
};


// --- The final export wraps everything in the ReactFlowProvider ---
export function QuestMap() {
  return (
    <>
      <div className="container relative mx-auto px-4 py-8">
        {/* Header and Badges */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-balance text-3xl font-bold bg-gradient-to-r from-[var(--game-green)] via-[var(--game-yellow)] to-[var(--game-orange)] bg-clip-text text-transparent">
            Culinary Journey
          </h1>
          <p className="text-pretty text-lg" style={{ color: "var(--game-cream)" }}>
            Master foundations, explore flavors, and specialize in world cuisines
          </p>
        </div>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {/* Badges are unchanged */}
          <Badge variant="outline" className="border-2 border-[var(--game-green)] bg-[var(--game-green)]/20 text-[var(--game-green)] font-semibold" >
            <div className="mr-1 h-2 w-2 rounded-full bg-[var(--game-green)]" /> Completed
          </Badge>
          <Badge variant="outline" className="border-2 border-[var(--game-yellow)] bg-[var(--game-yellow)]/20 text-[var(--game-yellow)] font-semibold" >
            <div className="mr-1 h-2 w-2 rounded-full bg-[var(--game-yellow)]" /> Available
          </Badge>
          <Badge variant="outline" className="border-2 border-muted bg-muted/10 text-muted-foreground font-semibold">
            <Lock className="mr-1 h-3 w-3" /> Locked
          </Badge>
        </div>

        <div className="relative mx-auto h-[1200px] max-w-6xl rounded-lg border border-white/10 bg-[#001404]">
          <ReactFlowProvider>
            <QuestFlow />
          </ReactFlowProvider>
        </div>
      </div>
    </>
  );
}