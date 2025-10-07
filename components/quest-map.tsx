"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import Dagre from '@dagrejs/dagre';
import {
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

// --- Your original game data, WITHOUT the `position` property ---
const initialQuestNodes: Quest[] = [
  // Foundation Skills
  { id: 1, title: "Knife Safety", type: "lesson", category: "foundation", status: "completed", stars: 3, maxStars: 3, prerequisites: [] },
  { id: 2, title: "Basic Cuts", type: "lesson", category: "foundation", status: "available", stars: 0, maxStars: 3, prerequisites: [1] },
  { id: 3, title: "Measuring", type: "lesson", category: "foundation", status: "locked", stars: 0, maxStars: 3, prerequisites: [1] },
  { id: 4, title: "Salt & Seasoning", type: "concept", category: "flavor", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
  { id: 7, title: "Heat Control", type: "lesson", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
  { id: 10, title: "Simple Soup", type: "challenge", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [2, 3] },
  { id: 11, title: "GREATNESS", type: "lesson", category: "technique", status: "locked", stars: 0, maxStars: 3, prerequisites: [10, 3] },
];

const nodeTypes = {
  questNode: QuestNodeComponent,
};

// --- Dagre Layouting Function (Unchanged) ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR') => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });
  nodes.forEach((node) => g.setNode(node.id, { ...node, width: 128, height: 128 }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  Dagre.layout(g);
  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);
      return { ...node, position: { x: x - 128 / 2, y: y - 128 / 2 } };
    }),
    edges,
  };
};


// --- The Main Component that handles the Flow logic ---
const QuestFlow = () => {
  const [questData, setQuestData] = useState<Quest[]>(initialQuestNodes);
  const [selectedLesson, setSelectedLesson] = useState<Quest | null>(null);
  const [showReward, setShowReward] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<QuestNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  const isInitialRender = useRef(true);

  const handleNodeClick = (nodeData: Quest) => {
    if (nodeData.status !== "locked") {
      setSelectedLesson(nodeData);
    }
  };

  // 1. Calculate the stable layout ONCE using useMemo
  const stableLayout = useMemo(() => {
    const allNodes = initialQuestNodes.map(quest => ({
      id: quest.id.toString(),
      type: "questNode" as const,
      position: { x: 0, y: 0 },
      data: { ...quest, onClick: handleNodeClick },
    }));

    const allEdges: Edge[] = [];
    initialQuestNodes.forEach((quest) => {
      quest.prerequisites.forEach((prereqId) => {
        allEdges.push({ id: `e-${prereqId}-${quest.id}`, source: prereqId.toString(), target: quest.id.toString() });
      });
    });

    return getLayoutedElements(allNodes, allEdges, 'TB');
  }, []); // Empty dependency array means this runs only once

  
  // 2. Synchronize the UI with the current game state
  useEffect(() => {
    // Update nodes with the latest status from questData, but keep stable positions
    const updatedNodes = stableLayout.nodes.map(layoutNode => {
      const currentQuest = questData.find(q => q.id.toString() === layoutNode.id);
      return {
        ...layoutNode,
        data: {
          ...layoutNode.data,
          ...currentQuest,
        },
      };
    });

    // Dynamically filter which edges should be visible
    const visibleEdges = stableLayout.edges.filter(edge => {
      const sourceQuest = questData.find(q => q.id.toString() === edge.source);
      return sourceQuest?.status === 'completed';
    }).map(edge => {
      // Add styling to the visible edges
      const sourceNode = questData.find(n => n.id.toString() === edge.source);
      const targetNode = questData.find(n => n.id.toString() === edge.target);
      const isTargetAvailable = targetNode?.status === 'available';
      const isTargetCompleted = targetNode?.status === 'completed';
      return {
        ...edge,
        type: "smoothstep",
        animated: isTargetAvailable,
        style: { strokeWidth: 2, stroke: isTargetAvailable || isTargetCompleted ? 'var(--game-green)' : 'rgba(100, 116, 139, 0.4)', strokeDasharray: "6,4", opacity: isTargetAvailable || isTargetCompleted ? 0.8 : 0.5 },
      }
    });
    
    setNodes(updatedNodes);
    setEdges(visibleEdges);

    // if (isInitialRender.current) {
    //     window.requestAnimationFrame(() => fitView());
    //     isInitialRender.current = false;
    // }
  }, [questData, stableLayout, setNodes, setEdges, fitView]);


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
        autoPanOnNodeFocus={false}
        autoPanOnConnect={false}
        fitView={false}
      >
        <Background color="#4f4f4f" gap={24} variant={"dots"} />
      </ReactFlow>
      {showReward && <RewardPopup onClose={() => setShowReward(false)} />}
    </div>
  );
};

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
          {/* Badges */}
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