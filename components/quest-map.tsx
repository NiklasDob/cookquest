"use client"

import { Star, Lock, Crown, ChefHat, Flame, Sparkles, Globe, Wine, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { LessonScreen } from "@/components/lesson-screen"
import { RewardPopup } from "@/components/reward-popup"

interface QuestNode {
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

function getNodeIcon(node: QuestNode) {
  if (node.status === "locked") return <Lock className="h-8 w-8 text-muted-foreground/50" />
  if (node.type === "boss") return <Crown className="h-10 w-10" />
  if (node.type === "concept") return <Sparkles className="h-8 w-8" />
  if (node.type === "challenge") return <Flame className="h-8 w-8" />
  if (node.category === "cuisine") {
    if (node.cuisineType === "french") return <Wine className="h-8 w-8" />
    if (node.cuisineType === "italian") return <UtensilsCrossed className="h-8 w-8" />
    return <Globe className="h-8 w-8" />
  }
  return <ChefHat className="h-8 w-8" />
}

export function QuestMap() {
  const [questNodes, setQuestNodes] = useState<QuestNode[]>(initialQuestNodes)
  const [selectedLesson, setSelectedLesson] = useState<QuestNode | null>(null)
  const [showReward, setShowReward] = useState(false)

  const handleLessonComplete = () => {
    if (!selectedLesson) return

    // Update the completed lesson
    const updatedNodes = questNodes.map((node) => {
      if (node.id === selectedLesson.id) {
        return { ...node, status: "completed" as const, stars: 3 }
      }
      return node
    })

    // Unlock nodes that have all prerequisites completed
    const finalNodes = updatedNodes.map((node) => {
      if (node.status === "locked") {
        const allPrereqsCompleted = node.prerequisites.every((prereqId) => {
          const prereqNode = updatedNodes.find((n) => n.id === prereqId)
          return prereqNode?.status === "completed"
        })
        if (allPrereqsCompleted) {
          return { ...node, status: "available" as const }
        }
      }
      return node
    })

    setQuestNodes(finalNodes)
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

        <div className="relative mx-auto h-[1200px] max-w-5xl">
          {/* Path lines */}
          <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="pathGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--game-green)", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "var(--game-yellow)", stopOpacity: 0.4 }} />
              </linearGradient>
              <linearGradient id="pathGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--game-orange)", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "var(--game-terracotta)", stopOpacity: 0.4 }} />
              </linearGradient>
              <linearGradient id="pathGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--game-teal)", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "var(--game-purple)", stopOpacity: 0.4 }} />
              </linearGradient>
            </defs>
            {/* Path definitions... */}
            <path
              d="M 50% 3% L 40% 10% M 50% 3% L 60% 10%"
              fill="none"
              stroke="url(#pathGradient1)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 40% 10% L 25% 18% L 20% 26% L 25% 34%"
              fill="none"
              stroke="url(#pathGradient1)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 40% 10% L 50% 18% M 60% 10% L 50% 18%"
              fill="none"
              stroke="url(#pathGradient2)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 60% 10% L 75% 18% L 80% 26%"
              fill="none"
              stroke="url(#pathGradient3)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 50% 18% L 45% 26% M 50% 18% L 55% 26%"
              fill="none"
              stroke="url(#pathGradient2)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 25% 34% L 50% 42% M 45% 26% L 50% 42% M 55% 26% L 50% 42%"
              fill="none"
              stroke="url(#pathGradient1)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 50% 42% L 45% 50% M 50% 42% L 55% 50%"
              fill="none"
              stroke="url(#pathGradient2)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 45% 50% L 20% 60% L 15% 68% L 20% 76% L 15% 84%"
              fill="none"
              stroke="url(#pathGradient2)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 50% 42% L 50% 60% L 45% 68% L 50% 76% L 45% 84%"
              fill="none"
              stroke="url(#pathGradient3)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 55% 50% L 80% 60% L 85% 68% L 80% 76% L 85% 84%"
              fill="none"
              stroke="url(#pathGradient1)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 15% 84% L 50% 94% M 45% 84% L 50% 94% M 85% 84% L 50% 94%"
              fill="none"
              stroke="url(#pathGradient2)"
              strokeWidth="4"
              strokeDasharray="6,4"
            />
          </svg>

          {/* Quest Nodes */}
          {questNodes.map((node) => {
            const isDisabled = node.status === "locked"
            let iconColor = "var(--muted-foreground)"
            if (node.status === "completed") iconColor = "var(--game-green)"
            if (node.status === "available") iconColor = "var(--game-yellow)"

            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: node.position.top, left: node.position.left, zIndex: 1 }}
              >
                <Button
                  variant="ghost"
                  className="h-auto w-auto p-0"
                  disabled={isDisabled}
                  onClick={() => node.status !== "locked" && setSelectedLesson(node)}
                >
                  <Card
                    className={`relative flex h-28 w-28 flex-col items-center justify-center gap-1.5 border-4 transition-all ${
                      isDisabled
                        ? "border-muted/40 bg-muted/15 opacity-60"
                        : node.status === "completed"
                          ? "border-[var(--game-green)] bg-gradient-to-br from-[var(--game-green)]/30 to-[var(--game-sage)]/20 shadow-lg shadow-[var(--game-green)]/40"
                          : node.status === "available"
                            ? "border-[var(--game-yellow)] bg-gradient-to-br from-[var(--game-yellow)]/30 to-[var(--game-orange)]/20 shadow-xl shadow-[var(--game-yellow)]/50 hover:scale-110 hover:shadow-2xl hover:shadow-[var(--game-yellow)]/60"
                            : "bg-card/80"
                    } ${node.type === "boss" && !isDisabled ? "h-32 w-32 border-[var(--game-terracotta)] bg-gradient-to-br from-[var(--game-terracotta)]/50 to-[var(--game-orange)]/30 shadow-2xl shadow-[var(--game-terracotta)]/50 animate-pulse" : ""}`}
                  >
                    <div style={{ color: iconColor }}>{getNodeIcon(node)}</div>

                    <span
                      className="px-1 text-center text-[10px] font-bold leading-tight"
                      style={{
                        color: isDisabled ? "var(--muted-foreground)" : "var(--game-cream)",
                      }}
                    >
                      {node.title}
                    </span>

                    {!isDisabled && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: node.maxStars }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.5 w-2.5 ${
                              i < node.stars
                                ? "fill-[var(--game-yellow)] text-[var(--game-yellow)] drop-shadow-[0_0_4px_var(--game-yellow)]"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {showReward && <RewardPopup onClose={() => setShowReward(false)} />}
    </>
  )
}