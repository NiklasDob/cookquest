"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "@xyflow/react"
// Changed: CSS import path
import "@xyflow/react/dist/style.css"

import { Lock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LessonScreen } from "@/components/lesson-screen"
import { RewardPopup } from "@/components/reward-popup"
import QuestNodeComponent, { QuestNodeData } from "./quest-node"

// Your original data structure and initial data
interface Quest {
  id: number
  title: string
  type: "lesson" | "challenge" | "boss" | "concept"
  category: "foundation" | "technique" | "flavor" | "cuisine" | "advanced"
  cuisineType?: "french" | "asian" | "italian"
  status: "locked" | "available" | "completed"
  stars: number
  maxStars: 3
  position: { top: string; left: string }
  prerequisites: number[]
}
const initialQuestNodes: QuestNode[] = [
  // Foundation Skills - Only first one unlocked
  {
    id: 1,
    title: "Knife Safety",
    type: "lesson",
    category: "foundation",
    status: "completed",
    stars: 3,
    maxStars: 3,
    position: { top: "3%", left: "50%" },
    prerequisites: [],
  },
  {
    id: 2,
    title: "Basic Cuts",
    type: "lesson",
    category: "foundation",
    status: "available",
    stars: 0,
    maxStars: 3,
    position: { top: "10%", left: "40%" },
    prerequisites: [1],
  },
  {
    id: 3,
    title: "Measuring",
    type: "lesson",
    category: "foundation",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "10%", left: "60%" },
    prerequisites: [1],
  },

  // Flavor Fundamentals
  {
    id: 4,
    title: "Salt & Seasoning",
    type: "concept",
    category: "flavor",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "18%", left: "25%" },
    prerequisites: [2, 3],
  },
  {
    id: 5,
    title: "Balancing Sweetness",
    type: "concept",
    category: "flavor",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "26%", left: "20%" },
    prerequisites: [4],
  },
  {
    id: 6,
    title: "Acidity & Brightness",
    type: "concept",
    category: "flavor",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "34%", left: "25%" },
    prerequisites: [5],
  },

  // Technique Skills
  {
    id: 7,
    title: "Heat Control",
    type: "lesson",
    category: "technique",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "18%", left: "50%" },
    prerequisites: [2, 3],
  },
  {
    id: 8,
    title: "Sautéing",
    type: "challenge",
    category: "technique",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "26%", left: "45%" },
    prerequisites: [7],
  },
  {
    id: 9,
    title: "Roasting",
    type: "challenge",
    category: "technique",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "26%", left: "55%" },
    prerequisites: [7],
  },

  // Recipe Challenges
  {
    id: 10,
    title: "Simple Soup",
    type: "challenge",
    category: "technique",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "18%", left: "75%" },
    prerequisites: [2, 3],
  },
  {
    id: 11,
    title: "Perfect Pasta",
    type: "challenge",
    category: "technique",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "26%", left: "80%" },
    prerequisites: [10],
  },

  // Advanced Sauces
  {
    id: 12,
    title: "Mother Sauces",
    type: "lesson",
    category: "advanced",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "42%", left: "50%" },
    prerequisites: [4, 7, 8, 9],
  },
  {
    id: 13,
    title: "Emulsions",
    type: "lesson",
    category: "advanced",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "50%", left: "45%" },
    prerequisites: [12],
  },
  {
    id: 14,
    title: "Reduction Techniques",
    type: "lesson",
    category: "advanced",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "50%", left: "55%" },
    prerequisites: [12],
  },

  // French Culinary Path
  {
    id: 15,
    title: "French Basics",
    type: "lesson",
    category: "cuisine",
    cuisineType: "french",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "60%", left: "20%" },
    prerequisites: [12, 13],
  },
  {
    id: 16,
    title: "Mirepoix & Aromatics",
    type: "lesson",
    category: "cuisine",
    cuisineType: "french",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "68%", left: "15%" },
    prerequisites: [15],
  },
  {
    id: 17,
    title: "Coq au Vin",
    type: "challenge",
    category: "cuisine",
    cuisineType: "french",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "76%", left: "20%" },
    prerequisites: [16],
  },
  {
    id: 18,
    title: "Beef Bourguignon",
    type: "challenge",
    category: "cuisine",
    cuisineType: "french",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "84%", left: "15%" },
    prerequisites: [17],
  },

  // Asian Culinary Path
  {
    id: 19,
    title: "Asian Fundamentals",
    type: "lesson",
    category: "cuisine",
    cuisineType: "asian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "60%", left: "50%" },
    prerequisites: [8, 9, 11],
  },
  {
    id: 20,
    title: "Wok Techniques",
    type: "lesson",
    category: "cuisine",
    cuisineType: "asian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "68%", left: "45%" },
    prerequisites: [19],
  },
  {
    id: 21,
    title: "Stir-Fry Master",
    type: "challenge",
    category: "cuisine",
    cuisineType: "asian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "76%", left: "50%" },
    prerequisites: [20],
  },
  {
    id: 22,
    title: "Dim Sum Delights",
    type: "challenge",
    category: "cuisine",
    cuisineType: "asian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "84%", left: "45%" },
    prerequisites: [21],
  },

  // Italian Culinary Path
  {
    id: 23,
    title: "Italian Classics",
    type: "lesson",
    category: "cuisine",
    cuisineType: "italian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "60%", left: "80%" },
    prerequisites: [11, 14],
  },
  {
    id: 24,
    title: "Fresh Pasta Making",
    type: "lesson",
    category: "cuisine",
    cuisineType: "italian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "68%", left: "85%" },
    prerequisites: [23],
  },
  {
    id: 25,
    title: "Risotto Perfection",
    type: "challenge",
    category: "cuisine",
    cuisineType: "italian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "76%", left: "80%" },
    prerequisites: [24],
  },
  {
    id: 26,
    title: "Osso Buco",
    type: "challenge",
    category: "cuisine",
    cuisineType: "italian",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "84%", left: "85%" },
    prerequisites: [25],
  },

  // Final Boss
  {
    id: 27,
    title: "Grand Chef Challenge",
    type: "boss",
    category: "advanced",
    status: "locked",
    stars: 0,
    maxStars: 3,
    position: { top: "94%", left: "50%" },
    prerequisites: [18, 22, 26],
  },
]


const nodeTypes = {
  questNode: QuestNodeComponent,
}

const getPosition = (top: string, left: string, containerWidth: number, containerHeight: number) => {
  const topPercent = parseFloat(top) / 100
  const leftPercent = parseFloat(left) / 100
  return { x: leftPercent * containerWidth - 64, y: topPercent * containerHeight - 64 }
}

// Function to transform your game data into React Flow's format
const transformDataForFlow = (
  quests: Quest[],
  onClick: (data: QuestNodeData) => void,
): { nodes: Node<QuestNodeData>[]; edges: Edge[] } => {
  const containerWidth = 1024
  const containerHeight = 1200

  // Node creation logic remains the same
  const nodes: Node<QuestNodeData>[] = quests.map((quest) => ({
    id: quest.id.toString(),
    type: "questNode",
    position: getPosition(quest.position.top, quest.position.left, containerWidth, containerHeight),
    data: { ...quest, onClick },
    draggable: false,
    connectable: false,
  }))

  const edges: Edge[] = []
  quests.forEach((targetQuest) => {
    targetQuest.prerequisites.forEach((prereqId) => {
      const sourceNode = quests.find((n) => n.id === prereqId)

      // **NEW LOGIC**: Only draw an edge if the source node is completed.
      if (sourceNode && sourceNode.status === 'completed') {
        const isTargetAvailable = targetQuest.status === 'available';
        const isTargetCompleted = targetQuest.status === 'completed';

        edges.push({
          id: `e-${prereqId}-${targetQuest.id}`,
          source: prereqId.toString(),
          target: targetQuest.id.toString(),
          type: "smoothstep",
          // Animate the line only if the next quest is newly available
          animated: isTargetAvailable,
          style: {
            strokeWidth: 2,
            // If the next quest is unlocked or done, use a bright color. Otherwise, use a faint color for locked paths.
            stroke: isTargetAvailable || isTargetCompleted 
              ? 'var(--game-green)' 
              : 'rgba(100, 116, 139, 0.4)', // Faded color for visible but locked paths
            strokeDasharray: "6,4",
            opacity: isTargetAvailable || isTargetCompleted ? 0.8 : 0.5,
          },
        })
      }
    })
  })

  return { nodes, edges }
}
export function QuestMap() {
  // Your original game state
  const [questData, setQuestData] = useState<Quest[]>(initialQuestNodes)
  const [selectedLesson, setSelectedLesson] = useState<Quest | null>(null)
  const [showReward, setShowReward] = useState(false)

  // New: State management for React Flow nodes and edges
  const [nodes, setNodes] = useState<Node<QuestNodeData>[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  const handleNodeClick = (nodeData: Quest) => {
    if (nodeData.status !== "locked") {
      setSelectedLesson(nodeData)
    }
  }

  // New: useEffect to synchronize your game state with the React Flow state
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = transformDataForFlow(questData, handleNodeClick)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [questData]) // This effect runs whenever your questData changes

  // New: Required handlers for React Flow v12+
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  )

  const handleLessonComplete = () => {
    if (!selectedLesson) return

    const updatedQuests = questData.map((node) => {
      if (node.id === selectedLesson.id) {
        return { ...node, status: "completed" as const, stars: 3 }
      }
      return node
    })

    const finalQuests = updatedQuests.map((node) => {
      if (node.status === "locked") {
        const allPrereqsCompleted = node.prerequisites.every((prereqId) => {
          const prereqNode = updatedQuests.find((n) => n.id === prereqId)
          return prereqNode?.status === "completed"
        })
        if (allPrereqsCompleted) {
          return { ...node, status: "available" as const }
        }
      }
      return node
    })

    // This single state update will trigger the useEffect to update the flow
    setQuestData(finalQuests)
    setSelectedLesson(null)
    setShowReward(true)
  }

  if (selectedLesson) {
    return (
      <LessonScreen lesson={selectedLesson} onComplete={handleLessonComplete} onBack={() => setSelectedLesson(null)} />
    )
  }

  return (
    <>
      <div className="container relative mx-auto px-4 py-8">
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
          <Badge
            variant="outline"
            className="border-2 border-[var(--game-green)] bg-[var(--game-green)]/20 text-[var(--game-green)] font-semibold"
          >
            <div className="mr-1 h-2 w-2 rounded-full bg-[var(--game-green)]" />
            Completed
          </Badge>
          <Badge
            variant="outline"
            className="border-2 border-[var(--game-yellow)] bg-[var(--game-yellow)]/20 text-[var(--game-yellow)] font-semibold"
          >
            <div className="mr-1 h-2 w-2 rounded-full bg-[var(--game-yellow)]" />
            Available
          </Badge>
          <Badge variant="outline" className="border-2 border-muted bg-muted/10 text-muted-foreground font-semibold">
            <Lock className="mr-1 h-3 w-3" />
            Locked
          </Badge>
        </div>

        <div className="relative mx-auto h-[1200px] max-w-5xl rounded-lg border border-white/10 bg-[#001404]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            zoomOnScroll={false}
            panOnDrag={false}
            fitView
          >
            <Background color="#4f4f4f" gap={24} variant={"dots"} />
          </ReactFlow>
        </div>
      </div>

      {showReward && <RewardPopup onClose={() => setShowReward(false)} />}
    </>
  )
}
