"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FillInBlankGameProps {
  question: {
    blankText?: string
    correctAnswers?: string[]
  }
  onAnswer: (answer: string) => void
}

export function FillInBlankGame({ question, onAnswer }: FillInBlankGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const blankText = question.blankText ?? ""
  const correctAnswers = question.correctAnswers ?? []

  // Create answer options by combining correct answers with some distractors
  // Use useMemo to ensure this only runs once per question
  const answerOptions = useMemo(() => {
    // Take only the first correct answer to ensure single correct option
    const primaryCorrectAnswer = correctAnswers[0] || ""
    const options = [primaryCorrectAnswer]
    
    // Add some common cooking-related distractors based on the context
    const distractors = [
      "slice", "chop", "mince", "julienne", "dice", "cube", "strip", "shred",
      "cut", "trim", "peel", "core", "seed", "segment", "wedge", "round"
    ]
    
    // Add 3-4 distractors that aren't the correct answer
    const availableDistractors = distractors.filter(d => 
      d.toLowerCase() !== primaryCorrectAnswer.toLowerCase()
    )
    
    // Shuffle and take 3-4 distractors
    const shuffledDistractors = availableDistractors.sort(() => Math.random() - 0.5)
    options.push(...shuffledDistractors.slice(0, 4))
    
    // Shuffle all options
    return options.sort(() => Math.random() - 0.5)
  }, [correctAnswers]) // Only recalculate when correctAnswers change

  const handleAnswerSelect = (answer: string) => {
    if (!submitted) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmit = () => {
    if (selectedAnswer) {
      setSubmitted(true)
      onAnswer(selectedAnswer)

      // setTimeout(() => {
      // }, 1500)
    }
  }

  const primaryCorrectAnswer = correctAnswers[0] || ""
  const isCorrect = submitted && primaryCorrectAnswer.toLowerCase() === selectedAnswer?.toLowerCase()

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
                  <div className={`w-32 h-10 rounded-md border-2 flex items-center justify-center font-bold text-lg ${
                    submitted
                      ? isCorrect
                        ? "border-[var(--game-green)] bg-[var(--game-green)]/10 text-[var(--game-green)]"
                        : "border-red-500 bg-red-500/10 text-red-500"
                      : selectedAnswer
                      ? "border-[var(--game-yellow)] bg-[var(--game-yellow)]/10 text-[var(--game-yellow)]"
                      : "border-[var(--game-yellow)] bg-black/20 text-white"
                  }`}>
                    {selectedAnswer || "?"}
                  </div>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {answerOptions.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option.toLowerCase() === primaryCorrectAnswer.toLowerCase()
          
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
              className={`p-3 transition-all ${cardClass}`}
              onClick={() => handleAnswerSelect(option)}
            >
              <div className="text-center font-medium text-white">
                {option}
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
            disabled={!selectedAnswer}
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
              Correct answer: {primaryCorrectAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}