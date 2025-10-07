"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Sparkles, Star } from "lucide-react"
import { useEffect, useState } from "react"

interface RewardPopupProps {
  onClose: () => void
}

export function RewardPopup({ onClose }: RewardPopupProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Trigger the animation shortly after mounting
    const timer = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    // The main overlay with a dark tint and a backdrop blur effect
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm">
      <Card
        className={`relative w-full max-w-md transform overflow-visible rounded-3xl border-4 border-[var(--game-yellow)] bg-card/80 p-6 text-center shadow-2xl shadow-[var(--game-yellow)]/40 backdrop-blur-lg transition-all duration-500 ease-out ${
          show ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Animated sparkles in the background */}
        <div className="absolute inset-0 z-0 opacity-50">
          {Array.from({ length: 15 }).map((_, i) => (
            <Sparkles
              key={i}
              className="absolute animate-pulse text-[var(--game-yellow)]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Trophy icon positioned above the card */}
          <div className="absolute -top-20 rounded-full bg-gradient-to-br from-[var(--game-yellow)] to-[var(--game-orange)] p-5 shadow-lg">
            <Trophy className="h-14 w-14 text-white drop-shadow-md" />
          </div>

          <h2 className="mt-10 text-4xl font-bold text-[var(--game-green)] drop-shadow-lg [text-shadow:0_2px_4px_var(--tw-shadow-color)] shadow-black/30">
            Lesson Complete!
          </h2>

          <div className="my-3 flex justify-center gap-1.5">
            <Star className="h-6 w-6 fill-[var(--game-yellow)] text-[var(--game-yellow)] drop-shadow-md" />
            <Star className="h-6 w-6 fill-[var(--game-yellow)] text-[var(--game-yellow)] drop-shadow-md" />
            <Star className="h-6 w-6 fill-[var(--game-yellow)] text-[var(--game-yellow)] drop-shadow-md" />
          </div>

          <div className="my-4 w-full space-y-3">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">XP Gained</p>
              <p className="text-3xl font-bold text-[var(--game-green)] drop-shadow-md">+50 XP</p>
            </div>

            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Badge Unlocked</p>
              <p className="text-2xl font-bold text-[var(--game-terracotta)] drop-shadow-md">
                🏆 Chopping Master
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="mt-4 h-14 w-full rounded-xl border-b-4 border-green-900/50 bg-[var(--game-green)] text-xl font-bold text-primary-foreground transition-transform duration-100 ease-out hover:scale-[1.02] active:translate-y-0.5 active:border-b-2"
            onClick={onClose}
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  )
}