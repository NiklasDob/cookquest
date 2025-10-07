"use client"

import { memo } from "react"
// Changed: Import from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'; 
import { Star, Lock, Crown, ChefHat, Flame, Sparkles, Globe, Wine, UtensilsCrossed } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// The QuestNodeData interface is unchanged
export interface QuestNodeData {
  id: string
  title: string
  type: "lesson" | "challenge" | "boss" | "concept"
  category: "foundation" | "technique" | "flavor" | "cuisine" | "advanced"
  cuisineType?: "french" | "asian" | "italian"
  status: "locked" | "available" | "completed"
  stars: number
  maxStars: 3
  prerequisites: string[]
  onClick: (node: QuestNodeData) => void
}

// Icon helper function is unchanged
function getNodeIcon(node: QuestNodeData) {
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

// The custom node component itself is unchanged
const QuestNode = memo(({ data }: { data: QuestNodeData }) => {
  const isDisabled = data.status === "locked"
  let iconColor = "var(--muted-foreground)"
  if (data.status === "completed") iconColor = "var(--game-green)"
  if (data.status === "available") iconColor = "var(--game-yellow)"

  return (
    <>
      <Handle type="target" position={Position.Top} className="!border-0 !bg-transparent" />
      <Handle type="source" position={Position.Bottom} className="!border-0 !bg-transparent" />

      <Button
        variant="ghost"
        className="h-auto w-auto p-0"
        disabled={isDisabled}
        onClick={() => !isDisabled && data.onClick(data)}
        title={data.title}
      >
        <Card
          className={`relative flex h-28 w-28 flex-col items-center justify-center gap-1.5 border-4 transition-all ${
            isDisabled
              ? "border-muted/40 bg-muted/15 opacity-60"
              : data.status === "completed"
              ? "border-[var(--game-green)] bg-gradient-to-br from-[var(--game-green)]/30 to-[var(--game-sage)]/20 shadow-lg shadow-[var(--game-green)]/40"
              : data.status === "available"
              ? "border-[var(--game-yellow)] bg-gradient-to-br from-[var(--game-yellow)]/30 to-[var(--game-orange)]/20 shadow-xl shadow-[var(--game-yellow)]/50 hover:scale-110 hover:shadow-2xl hover:shadow-[var(--game-yellow)]/60"
              : "bg-card/80"
          } ${
            data.type === "boss" && !isDisabled
              ? "h-32 w-32 border-[var(--game-terracotta)] bg-gradient-to-br from-[var(--game-terracotta)]/50 to-[var(--game-orange)]/30 shadow-2xl shadow-[var(--game-terracotta)]/50 animate-pulse"
              : ""
          }`}
        >
          <div style={{ color: iconColor }}>{getNodeIcon(data)}</div>

          <span
            className="px-1 text-center text-[10px] font-bold leading-tight"
            style={{
              color: isDisabled ? "var(--muted-foreground)" : "var(--game-cream)",
            }}
          >
            {data.title}
          </span>

          {!isDisabled && (
            <div className="flex gap-0.5">
              {Array.from({ length: data.maxStars }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    i < data.stars
                      ? "fill-[var(--game-yellow)] text-[var(--game-yellow)] drop-shadow-[0_0_4px_var(--game-yellow)]"
                      : "text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          )}
        </Card>
      </Button>
    </>
  )
})

QuestNode.displayName = "QuestNode"

export default QuestNode