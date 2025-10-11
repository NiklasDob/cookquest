"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Gamepad2 } from "lucide-react"
import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { MinigameScreen } from "./minigame-screen"
// import { LessonContent } from "./lesson-content" // We'll extract the content logic for cleanliness

interface LessonScreenProps {
  lesson: {
    id: string
    title: string
    category?: string
  }
  onComplete: () => void
  onBack: () => void
  userId?: string
}

export function LessonScreen({ lesson, onComplete, onBack, userId = "default-user" }: LessonScreenProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showMinigame, setShowMinigame] = useState(false)
  const [minigameEnabled, setMinigameEnabled] = useState(true)
  
  // Fetch content to derive total steps dynamically
  const content = useQuery(api.myFunctions.getLessonContentByQuest, { questId: lesson.id as unknown as Id<"quests"> })
  const minigame = useQuery(api.myFunctions.getMinigameByQuest, { questId: lesson.id as unknown as Id<"quests"> })
  const totalSteps = Math.max(1, (content?.steps?.length ?? 1))

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Check if minigame should be shown
      if (minigameEnabled && minigame?.enabled) {
        setShowMinigame(true)
      } else {
        onComplete()
      }
    }
  }

  const handleMinigameComplete = (passed: boolean, score: number) => {
    setShowMinigame(false)
    onComplete()
  }

  const handleMinigameBack = () => {
    setShowMinigame(false)
  }

  // Show minigame if it should be displayed
  if (showMinigame && minigame) {
    return (
      <MinigameScreen
        questId={lesson.id as unknown as Id<"quests">}
        onComplete={handleMinigameComplete}
        onBack={handleMinigameBack}
        userId={userId}
      />
    )
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

            {/* Minigame Toggle */}
            {minigame && (
              <div className="mb-4 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinigameEnabled(!minigameEnabled)}
                  className={`flex items-center gap-2 ${
                    minigameEnabled 
                      ? "border-[var(--game-green)] bg-[var(--game-green)]/10 text-[var(--game-green)]" 
                      : "border-muted-foreground bg-muted/10 text-muted-foreground"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  {minigameEnabled ? "Minigame Enabled" : "Minigame Disabled"}
                </Button>
              </div>
            )}

            {/* Lesson Content and Buttons are passed into a separate component for readability */}
            <LessonContent lesson={lesson} onNext={handleNext} content={content} currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </Card>
    </div>
  )
}


// --- New Component for better organization ---
// `components/lesson-content.tsx`

import { Lightbulb, RotateCcw } from "lucide-react"

// Define props for the new component
interface LessonContentProps {
  lesson: { id: string; title: string };
  onNext: () => void;
  content?: {
    _id: Id<"lessonContents">;
    _creationTime: number;
    questId: Id<"quests">;
    emoji: string;
    heading: string;
    description: string;
    steps: string[];
    hints: string[];
  } | null;
  currentStep: number;
  totalSteps: number;
}

export function LessonContent({ lesson, onNext, content, currentStep, totalSteps }: LessonContentProps) {
  
  const effectiveSteps = content?.steps ?? [];
  
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
          <p className="text-pretty text-base text-muted-foreground">{content?.description ?? "Master this essential cooking skill to progress on your culinary journey."}</p>
          <p className="mt-3 text-pretty text-2xl font-semibold text-white">{effectiveSteps[currentStep - 1]}</p>
        
         
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