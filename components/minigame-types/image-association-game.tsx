"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ImageAssociationGameProps {
  question: {
    imageUrl?: string
    associatedTerms?: string[]
  }
  onAnswer: (answer: string) => void
}

export function ImageAssociationGame({ question, onAnswer }: ImageAssociationGameProps) {
  const [answer, setAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const imageUrl = question.imageUrl ?? ""
  const associatedTerms = question.associatedTerms ?? []

  const handleSubmit = () => {
    if (answer.trim()) {
      setSubmitted(true)
      setTimeout(() => {
        onAnswer(answer.trim())
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  const isCorrect = submitted && associatedTerms.some(term => 
    term.toLowerCase() === answer.toLowerCase()
  )

  return (
    <div className="space-y-6">
      {/* Image */}
      {imageUrl && (
        <div className="text-center">
          <div className="inline-block p-4 bg-black/20 rounded-lg border border-white/10">
            <img 
              src={imageUrl} 
              alt="Association prompt"
              className="max-w-full max-h-64 rounded-lg"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'block'
              }}
            />
            <div 
              className="text-6xl hidden"
              style={{ display: 'none' }}
            >
              🍋
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="text-center">
        <div className="mb-4">
          <label className="block text-lg font-semibold text-white mb-2">
            What cooking element does this represent?
          </label>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-64 text-center font-bold text-lg ${
              submitted
                ? isCorrect
                  ? "border-[var(--game-green)] bg-[var(--game-green)]/10 text-[var(--game-green)]"
                  : "border-red-500 bg-red-500/10 text-red-500"
                : "border-[var(--game-yellow)] bg-black/20 text-white"
            }`}
            disabled={submitted}
            placeholder="Enter your answer..."
          />
        </div>
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="bg-[var(--game-green)] text-black font-bold hover:bg-[var(--game-yellow)] disabled:opacity-50"
          >
            Submit Answer
          </Button>
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div className="text-center">
          <div className={`text-xl font-bold mb-2 ${
            isCorrect ? "text-[var(--game-green)]" : "text-red-500"
          }`}>
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          {!isCorrect && (
            <div className="text-sm text-muted-foreground">
              Correct answers: {associatedTerms.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
