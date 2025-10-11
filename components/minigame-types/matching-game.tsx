"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MatchingGameProps {
  question: {
    leftItems?: string[]
    rightItems?: string[]
    correctMatches?: Array<{ leftIndex: number; rightIndex: number }>
  }
  onAnswer: (answer: Array<{ leftIndex: number; rightIndex: number }>) => void
}

export function MatchingGame({ question, onAnswer }: MatchingGameProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [selectedRight, setSelectedRight] = useState<number | null>(null)
  const [matches, setMatches] = useState<Array<{ leftIndex: number; rightIndex: number }>>([])
  const [completedLeft, setCompletedLeft] = useState<Set<number>>(new Set())
  const [completedRight, setCompletedRight] = useState<Set<number>>(new Set())

  const leftItems = question.leftItems ?? []
  const rightItems = question.rightItems ?? []

  const handleLeftClick = (index: number) => {
    if (completedLeft.has(index)) return
    
    if (selectedLeft === index) {
      setSelectedLeft(null)
    } else {
      setSelectedLeft(index)
      if (selectedRight !== null) {
        createMatch(index, selectedRight)
      }
    }
  }

  const handleRightClick = (index: number) => {
    if (completedRight.has(index)) return
    
    if (selectedRight === index) {
      setSelectedRight(null)
    } else {
      setSelectedRight(index)
      if (selectedLeft !== null) {
        createMatch(selectedLeft, index)
      }
    }
  }

  const createMatch = (leftIndex: number, rightIndex: number) => {
    const newMatch = { leftIndex, rightIndex }
    setMatches(prev => [...prev, newMatch])
    setCompletedLeft(prev => new Set([...prev, leftIndex]))
    setCompletedRight(prev => new Set([...prev, rightIndex]))
    setSelectedLeft(null)
    setSelectedRight(null)
    console.log("newMatch", newMatch)
    console.log("matches", matches)
    console.log("leftItems", leftItems)
    console.log("rightItems", rightItems)

    // Check if all items are matched
    if (matches.length + 1 === leftItems.length) {
      setTimeout(() => {
        onAnswer([...matches, newMatch])
      }, 500)
    }
  }

  const getMatchForLeft = (leftIndex: number) => {
    return matches.find(match => match.leftIndex === leftIndex)
  }

  const getMatchForRight = (rightIndex: number) => {
    return matches.find(match => match.rightIndex === rightIndex)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-muted-foreground text-center">Terms</h5>
          {leftItems.map((item, index) => {
            const match = getMatchForLeft(index)
            const isSelected = selectedLeft === index
            const isCompleted = completedLeft.has(index)
            
            return (
              <Card
                key={index}
                className={`p-3 cursor-pointer transition-all ${
                  isCompleted
                    ? "bg-[var(--game-green)]/20 border-[var(--game-green)]"
                    : isSelected
                    ? "bg-[var(--game-yellow)]/20 border-[var(--game-yellow)]"
                    : "bg-black/20 border-white/10 hover:border-white/20"
                }`}
                onClick={() => handleLeftClick(index)}
              >
                <div className="text-center font-medium text-white">
                  {item}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-muted-foreground text-center">Descriptions</h5>
          {rightItems.map((item, index) => {
            const match = getMatchForRight(index)
            const isSelected = selectedRight === index
            const isCompleted = completedRight.has(index)
            
            return (
              <Card
                key={index}
                className={`p-3 cursor-pointer transition-all ${
                  isCompleted
                    ? "bg-[var(--game-green)]/20 border-[var(--game-green)]"
                    : isSelected
                    ? "bg-[var(--game-yellow)]/20 border-[var(--game-yellow)]"
                    : "bg-black/20 border-white/10 hover:border-white/20"
                }`}
                onClick={() => handleRightClick(index)}
              >
                <div className="text-center font-medium text-white">
                  {item}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        Click on a term, then click on its matching description
      </div>

      {/* Progress */}
      <div className="text-center">
        <div className="text-lg font-bold text-[var(--game-yellow)]">
          {matches.length} / {leftItems.length}
        </div>
        <div className="text-sm text-muted-foreground">Matches Complete</div>
      </div>
    </div>
  )
}
