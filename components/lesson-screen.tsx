"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, RotateCcw } from "lucide-react"
import { useState } from "react"

interface LessonScreenProps {
  lesson: {
    title: string
    category?: string
  }
  onComplete: () => void
  onBack: () => void
}

export function LessonScreen({ lesson, onComplete, onBack }: LessonScreenProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const handleNext = () => {
    console.log("[v0] Current step:", currentStep, "Total steps:", totalSteps)
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      console.log("[v0] Completing lesson")
      onComplete()
    }
  }

  const getLessonContent = () => {
    if (lesson.title.includes("Salt")) {
      return {
        emoji: "🧂",
        heading: "Understanding Salt",
        description:
          "Salt enhances flavors and balances sweetness. Add it gradually and taste as you go. Different salts have different intensities.",
      }
    }
    if (lesson.title.includes("Heat")) {
      return {
        emoji: "🔥",
        heading: "Mastering Heat Control",
        description:
          "Low heat for gentle cooking, medium for sautéing, high heat for searing. The pan should be hot before adding ingredients.",
      }
    }
    if (lesson.title.includes("French")) {
      return {
        emoji: "🇫🇷",
        heading: "French Cooking Basics",
        description:
          "French cuisine emphasizes technique, quality ingredients, and classic preparations. Master the fundamentals first.",
      }
    }
    if (lesson.title.includes("Asian")) {
      return {
        emoji: "🥢",
        heading: "Asian Cooking Fundamentals",
        description:
          "Balance is key: sweet, salty, sour, bitter, and umami. High heat and quick cooking preserve texture and nutrients.",
      }
    }
    if (lesson.title.includes("Knife")) {
      return {
        emoji: "🔪",
        heading: "Knife Safety First",
        description:
          "Always cut away from your body. Keep your knives sharp - a dull knife is more dangerous. Use a stable cutting board.",
      }
    }
    if (lesson.title.includes("Cuts")) {
      return {
        emoji: "🥕",
        heading: "Master Basic Cuts",
        description: "Learn dice, julienne, and chiffonade. Uniform cuts ensure even cooking. Practice makes perfect!",
      }
    }
    return {
      emoji: "👨‍🍳",
      heading: lesson.title,
      description: "Master this essential cooking skill to progress on your culinary journey.",
    }
  }

  const content = getLessonContent()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold" style={{ color: "var(--game-green)" }}>
            {lesson.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Bar */}
      <div className="mb-8 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--game-green)] to-[var(--game-sage)] transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <Card className="mb-6 border-border/50 bg-card/50 p-8 backdrop-blur">
        <div className="mb-6 flex justify-center">
          <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--game-yellow)]/20 to-[var(--game-orange)]/20">
            <div className="text-center">
              <div className="mb-4 text-6xl">{content.emoji}</div>
              <p className="text-sm font-medium text-muted-foreground">Interactive lesson</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="mb-3 text-2xl font-bold text-foreground">{content.heading}</h3>
          <p className="text-pretty text-muted-foreground">{content.description}</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="flex-1 border-border/50 bg-card/30">
          <Lightbulb className="mr-2 h-5 w-5" />
          Hint
        </Button>
        <Button variant="outline" size="lg" className="flex-1 border-border/50 bg-card/30">
          <RotateCcw className="mr-2 h-5 w-5" />
          Retry
        </Button>
      </div>

      <Button
        size="lg"
        className="mt-4 h-14 w-full rounded-xl border-b-4 border-green-900/50 bg-[var(--game-green)] text-xl font-bold text-primary-foreground transition-transform duration-100 ease-out hover:scale-[1.02] active:translate-y-0.5 active:border-b-2"

        // className="mt-4 w-full text-lg font-bold"
        style={{
          backgroundColor: "var(--game-green)",
          color: "var(--primary-foreground)",
        }}
        onClick={handleNext}
      >
        {currentStep === totalSteps ? "Complete Lesson" : "Next Step"}
      </Button>
    </div>
  )
}