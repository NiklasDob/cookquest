"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface MultipleChoiceGameProps {
  question: {
    options?: string[]
    correctOptionIndex?: number
  }
  onAnswer: (answer: number) => void
}

export function MultipleChoiceGame({ question, onAnswer }: MultipleChoiceGameProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const options = question.options ?? []
  const correctIndex = question.correctOptionIndex ?? 0

  const handleOptionClick = (index: number) => {
    if (!submitted) {
      setSelectedOption(index)
    }
  }

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true)
      setTimeout(() => {
        onAnswer(selectedOption)
      }, 1500)
    }
  }

  const isCorrect = submitted && selectedOption === correctIndex

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === index
          const isCorrectOption = index === correctIndex
          
          let cardClass = "bg-black/20 border-white/10 hover:border-white/20 cursor-pointer"
          
          if (submitted) {
            if (isCorrectOption) {
              cardClass = "bg-[var(--game-green)]/20 border-[var(--game-green)]"
            } else if (isSelected && !isCorrectOption) {
              cardClass = "bg-red-500/20 border-red-500"
            }
          } else if (isSelected) {
            cardClass = "bg-[var(--game-yellow)]/20 border-[var(--game-yellow)]"
          }

          return (
            <Card
              key={index}
              className={`p-4 transition-all ${cardClass}`}
              onClick={() => handleOptionClick(index)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  submitted
                    ? isCorrectOption
                      ? "border-[var(--game-green)] bg-[var(--game-green)]"
                      : isSelected
                      ? "border-red-500 bg-red-500"
                      : "border-muted-foreground"
                    : isSelected
                    ? "border-[var(--game-yellow)] bg-[var(--game-yellow)]"
                    : "border-muted-foreground"
                }`}>
                  {submitted && isCorrectOption && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                  {submitted && isSelected && !isCorrectOption && (
                    <span className="text-white text-xs font-bold">✗</span>
                  )}
                  {!submitted && isSelected && (
                    <span className="text-black text-xs font-bold">●</span>
                  )}
                </div>
                <span className="text-white font-medium">{option}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null}
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
          <div className="text-sm text-muted-foreground">
            {isCorrect 
              ? "Great job! You selected the right answer." 
              : `The correct answer was: ${options[correctIndex]}`
            }
          </div>
        </div>
      )}
    </div>
  )
}
