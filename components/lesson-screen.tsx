"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { useState, useMemo } from "react"
// import { LessonContent } from "./lesson-content" // We'll extract the content logic for cleanliness

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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  return (
    // Fullscreen Overlay Container (Unchanged)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0 overflow-y-auto">
      
      {/* 1. Main Popup Card Frame */}
      {/* Padding is removed from here (p-0) and moved to the inner scrolling container */}
      <Card className="relative w-full max-w-2xl border-4 border-[var(--game-yellow)]/30 bg-gradient-to-br from-gray-900 via-[#0a0f0a] to-green-950 p-0 shadow-2xl shadow-[var(--game-yellow)]/10 animate-in zoom-in-95">
        
        {/* Close button is kept outside the scrollable area for constant access */}
        <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-white">
          <X className="h-6 w-6" />
        </Button>

        {/* 2. Inner Scrolling Container */}
        {/* This div handles the overflow. It has a max-height relative to the viewport (vh)
            and custom scrollbar styling. All content goes inside this. */}
        <div className="max-h-[90vh] overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-green-800/50 hover:scrollbar-thumb-green-700">

            {/* Header */}
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--game-yellow)] to-[var(--game-green)] bg-clip-text text-transparent">
                {lesson.title}
              </h2>
              <p className="text-sm font-semibold text-muted-foreground">
                LESSON {currentStep} / {totalSteps}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 h-3 overflow-hidden rounded-full border-2 border-white/10 bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--game-yellow)] to-[var(--game-green)] transition-all duration-300 shadow-[0_0_10px_var(--game-green)]"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Lesson Content and Buttons are passed into a separate component for readability */}
            <LessonContent lesson={lesson} onNext={handleNext} currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </Card>
    </div>
  )
}


// --- New Component for better organization ---
// `components/lesson-content.tsx`

import { Lightbulb, RotateCcw } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

// Define props for the new component
interface LessonContentProps {
  lesson: { title: string };
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function LessonContent({ lesson, onNext, currentStep, totalSteps }: LessonContentProps) {
  // Fetch lesson content from Convex by title -> first find quest
  const quests = useQuery(api.myFunctions.listQuests);
  const quest = useMemo(() => (quests ?? []).find(q => q.title === lesson.title) as
    | { _id: Id<"quests">; title: string }
    | undefined, [quests, lesson.title]);
  const content = useQuery(api.myFunctions.getLessonContentByQuest, quest ? { questId: quest._id } : "skip");

  return (
    <>
      {/* Main Content Area */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-6">
        <div className="mb-6 flex justify-center">
          <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-[var(--game-yellow)]/20 bg-gradient-to-br from-[var(--game-yellow)]/10 to-transparent shadow-inner">
            <div className="text-center">
              <div className="mb-2 text-7xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{content?.emoji ?? "👨‍🍳"}</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="mb-3 text-3xl font-bold text-white">{content?.heading ?? lesson.title}</h3>
          <p className="text-pretty text-lg text-muted-foreground">{content?.description ?? "Master this essential cooking skill to progress on your culinary journey."}</p>
          {content && content.steps?.length > 0 && (
            <ul className="mt-4 text-left text-base text-muted-foreground list-disc list-inside space-y-1">
              {content.steps.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" size="lg" className="h-12 border-b-4 border-gray-700 bg-gray-800/80 text-base font-bold text-muted-foreground transition-transform hover:bg-gray-800/100 active:translate-y-0.5 active:border-b-2">
          <Lightbulb className="mr-2 h-5 w-5" />
          Hint
        </Button>
        <Button variant="outline" size="lg" className="h-12 border-b-4 border-gray-700 bg-gray-800/80 text-base font-bold text-muted-foreground transition-transform hover:bg-gray-800/100 active:translate-y-0.5 active:border-b-2">
          <RotateCcw className="mr-2 h-5 w-5" />
          Retry
        </Button>
      </div>

      {/* Main "Continue" Button */}
      <Button
        size="lg"
        className="mt-6 h-16 w-full rounded-xl border-b-4 border-green-900 bg-[var(--game-green)] text-xl font-bold text-black shadow-lg shadow-[var(--game-green)]/20 transition-all duration-100 ease-out hover:bg-[var(--game-yellow)] hover:shadow-[var(--game-yellow)]/30 active:translate-y-0.5 active:border-b-2"
        onClick={onNext}
      >
        {currentStep === totalSteps ? "Complete Lesson ✨" : "Continue"}
      </Button>
    </>
  )
}