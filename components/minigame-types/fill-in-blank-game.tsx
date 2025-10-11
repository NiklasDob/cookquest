"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FillInBlankGameProps {
  question: {
    blankText?: string
    correctAnswers?: string[]
  }
  onAnswer: (answer: string) => void
}

export function FillInBlankGame({ question, onAnswer }: FillInBlankGameProps) {
  const [answer, setAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const blankText = question.blankText ?? ""
  const correctAnswers = question.correctAnswers ?? []

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

  const isCorrect = submitted && correctAnswers.some(correct => 
    correct.toLowerCase() === answer.toLowerCase()
  )

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="text-center">
        <div className="text-lg text-white leading-relaxed">
          {blankText.split("_____").map((part, index) => (
            <span key={index}>
              {part}
              {index < blankText.split("_____").length - 1 && (
                <span className="inline-block mx-2">
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-32 text-center font-bold text-lg ${
                      submitted
                        ? isCorrect
                          ? "border-[var(--game-green)] bg-[var(--game-green)]/10 text-[var(--game-green)]"
                          : "border-red-500 bg-red-500/10 text-red-500"
                        : "border-[var(--game-yellow)] bg-black/20 text-white"
                    }`}
                    disabled={submitted}
                    placeholder="?"
                  />
                </span>
              )}
            </span>
          ))}
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
              Correct answers: {correctAnswers.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
