"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
  Panel,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LessonScreen } from "@/components/lesson-screen"
import { RewardPopup } from "@/components/reward-popup"
import QuestNodeComponent, { QuestNodeData } from "./quest-node"
import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { Id } from "@/convex/_generated/dataModel"

// --- The Quest interface mirrors the DB ---
interface Quest {
  _id: Id<"quests">
  title: string
  type: "lesson" | "challenge" | "boss" | "concept"
  category: "foundation" | "technique" | "flavor" | "cuisine" | "advanced"
  cuisineType?: "french" | "asian" | "italian"
  status: "locked" | "available" | "completed"
  stars: number
  maxStars: number
  prerequisites: Array<Id<"quests">>
}

const nodeTypes = { questNode: QuestNodeComponent } as unknown as NodeTypes;

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
  const convexQuests = useQuery(api.myFunctions.listQuests) as Array<Quest> | undefined
  const seed = useMutation(api.myFunctions.seedLessons)
  const completeQuest = useMutation(api.myFunctions.completeQuestAndUnlockDependents)

  const [questData, setQuestData] = useState<Quest[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<QuestNodeData | null>(null);
  const [showReward, setShowReward] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const { fitView } = useReactFlow();

  // Ref to store the previous quest data to detect changes
  const prevQuestDataRef = useRef(questData);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (node.data.status !== "locked") {
      setSelectedLesson(node.data as unknown as QuestNodeData);
    }
  };

  // Load quests from Convex into local state and seed if needed
  useEffect(() => {
    if (convexQuests === undefined) return;
    if (convexQuests.length === 0) {
      seed({}).catch(() => undefined);
      return;
    }
    setQuestData(convexQuests);
  }, [convexQuests, seed]);

  // 1. Calculate the stable layout from current data
  const stableLayout = useMemo(() => {
    const allNodes: Array<Node> = questData.map(quest => ({
      id: String(quest._id),
      type: "questNode" as const,
      position: { x: 0, y: 0 },
      data: {
        ...quest,
        id: String(quest._id),
        maxStars: 3,
        prerequisites: quest.prerequisites.map((p) => String(p)),
        onClick: (d: QuestNodeData) => handleNodeClick({} as React.MouseEvent, { id: d.id, position: { x: 0, y: 0 }, data: d } as unknown as Node),
      } as unknown as Record<string, unknown>,
    }));

    const allEdges: Edge[] = [];
    questData.forEach((quest) => {
      quest.prerequisites.forEach((prereqId) => {
        allEdges.push({ id: `e-${String(prereqId)}-${String(quest._id)}`, source: String(prereqId), target: String(quest._id) });
      });
    });

    return getLayoutedElements(allNodes, allEdges, 'TB');
  }, [questData]);

  // 2. Synchronize the UI and trigger animations
  useEffect(() => {
    const previousQuestData = prevQuestDataRef.current;

    const updatedNodes = stableLayout.nodes.map(layoutNode => {
      const currentQuest = questData.find(q => String(q._id) === layoutNode.id);
      return { ...layoutNode, data: { ...(layoutNode.data as Record<string, unknown>), ...(currentQuest ? { ...currentQuest, id: String(currentQuest._id), maxStars: 3, prerequisites: currentQuest.prerequisites.map(p => String(p)) } : {}) } } as Node;
    });

    const visibleEdges = stableLayout.edges.filter(edge => {
      const sourceQuest = questData.find(q => String(q._id) === edge.source);
      return sourceQuest?.status === 'completed';
    }).map(edge => {
      const targetNode = questData.find(n => String(n._id) === edge.target);
      const isTargetAvailable = targetNode?.status === 'available';
      const isTargetCompleted = targetNode?.status === 'completed';
      return {
        ...edge,
        type: "smoothstep",
        animated: isTargetAvailable,
        style: { strokeWidth: 2, stroke: isTargetAvailable || isTargetCompleted ? 'var(--game-green)' : 'rgba(100, 116, 139, 0.4)', strokeDasharray: "6,4", opacity: isTargetAvailable || isTargetCompleted ? 0.8 : 0.5 },
      };
    });

    setNodes(updatedNodes as Array<Node>);
    setEdges(visibleEdges as Array<Edge>);

    // --- Animation Logic ---
    const newlyAvailableNodes = questData.filter(currentQuest => {
      const prevQuest = previousQuestData.find(q => String(q._id) === String(currentQuest._id));
      return prevQuest && prevQuest.status === 'locked' && currentQuest.status === 'available';
    });

    if (newlyAvailableNodes.length > 0) {
      const nodeIds = newlyAvailableNodes.map(n => String(n._id));
      setTimeout(() => {
        fitView({
          nodes: nodeIds.map(id => ({ id })),
          duration: 800,
          padding: 0.2,
          maxZoom: 1.2,
        });
      }, 100);
    }

    // Update the ref for the next render
    prevQuestDataRef.current = questData;

  }, [questData, stableLayout, setNodes, setEdges, fitView]);

  // Fit view on initial load
  useEffect(() => {
    fitView({ duration: 200 });
  }, [fitView]);

  const handleLessonComplete = () => {
    if (!selectedLesson) return;
    const completed = questData.find(q => q.title === selectedLesson.title);
    if (completed) {
      completeQuest({ questId: completed._id, stars: 3 }).catch(() => undefined);
    }
    // Optimistic UI update: mark current as completed and unlock dependents
    // const completedId = completed?._id;
    // const optimistic = questData.map((node) =>
    //   node._id === completedId ? { ...node, status: "completed" as const, stars: 3 } : node
    // );
    // const unlocked = optimistic.map((node) => {
    //   if (node.status === "locked") {
    //     const allPrereqsCompleted = node.prerequisites.every((prereqId) =>
    //       optimistic.find((n) => String(n._id) === String(prereqId))?.status === "completed"
    //     );
    //     if (allPrereqsCompleted) return { ...node, status: "available" as const };
    //   }
    //   return node;
    // });
    // setQuestData(unlocked);
    setSelectedLesson(null);
    setShowReward(true);
  };

  if (selectedLesson) {
    return <LessonScreen lesson={{ title: selectedLesson.title }} onComplete={handleLessonComplete} onBack={() => setSelectedLesson(null)} />;
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Background color="#4f4f4f" gap={24} />
        <Panel position="top-right">
          <button onClick={() => fitView({ duration: 600 })} className="rounded bg-gray-700 px-2 py-1 text-white">
            Center View
          </button>
        </Panel>
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

        <div className="relative mx-auto h-128 max-w-6xl rounded-lg border border-white/10 bg-[#001404]">
          <ReactFlowProvider>
            <QuestFlow />
          </ReactFlowProvider>
        </div>
      </div>
    </>
  );
}