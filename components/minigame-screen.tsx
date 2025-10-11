"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Clock, Star, Trophy, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { MatchingGame } from "./minigame-types/matching-game"
import { FillInBlankGame } from "./minigame-types/fill-in-blank-game"
import { MultipleChoiceGame } from "./minigame-types/multiple-choice-game"
import { ImageAssociationGame } from "./minigame-types/image-association-game"

interface MinigameScreenProps {
  questId: Id<"quests">
  onComplete: (passed: boolean, score: number) => void
  onBack: () => void
  userId: string
}

export function MinigameScreen({ questId, onComplete, onBack, userId }: MinigameScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const minigame = useQuery(api.myFunctions.getMinigameByQuest, { questId })
  const questions = useQuery(api.myFunctions.getMinigameQuestions, { 
    minigameId: minigame?._id as Id<"minigames"> 
  }, minigame?._id ? {} : "skip")
  
  const submitAttempt = useMutation(api.myFunctions.submitMinigameAttempt)

  // Timer effect
  useEffect(() => {
    if (!gameStarted || !minigame?.timeLimit || gameCompleted) return

    setTimeRemaining(minigame.timeLimit)
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleGameComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, minigame?.timeLimit, gameCompleted])

  const handleAnswer = (questionIndex: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
    
    // Add a small delay to show feedback before moving to next question
    setTimeout(() => {
      if (questionIndex < (questions?.length ?? 0) - 1) {
        setCurrentQuestionIndex(questionIndex + 1)
      } else {
        handleGameComplete()
      }
    }, 100) // 2 second delay to show feedback
  }

  const handleGameComplete = () => {
    if (gameCompleted) return
    setGameCompleted(true)
    
    // Calculate score
    let correctAnswers = 0
   
    // questions?.forEach((question, index) => {
    //   totalPoints += question.points
    //   const userAnswer = answers[index]
      
    //   if (isAnswerCorrect(question, userAnswer)) {
    //     correctAnswers++
    //     earnedPoints += question.points
    //   }
    // })
    if(!questions) {
      return
    }
    let totalPoints = 0
    let earnedPoints = 0
    console.log("answers", answers) 
    for(const question of questions) {
      console.log("question", question)
      if(isAnswerCorrect(question, answers[totalPoints])) {
        earnedPoints += 1
        console.log("earnedPoints", earnedPoints)
      }
      totalPoints += 1
      console.log("totalPoints", totalPoints)
    }

    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    setScore(finalScore)
    setShowResults(true)

    // Submit attempt
    if (minigame) {
      submitAttempt({
        minigameId: minigame._id,
        questId,
        userId,
        score: finalScore,
        totalQuestions: questions?.length ?? 0,
        correctAnswers,
        timeSpent: minigame.timeLimit ? minigame.timeLimit - (timeRemaining ?? 0) : 0,
        passed: finalScore >= minigame.requiredScore,
      })
    }
  }

  const isAnswerCorrect = (question: any, userAnswer: any): boolean => {
    switch (question.questionType) {
      case "matching":
        return JSON.stringify(userAnswer) === JSON.stringify(question.correctMatches)
      case "fill-in-blank":
        return question.correctAnswers?.some((correct: string) => 
          correct.toLowerCase() === userAnswer?.toLowerCase()
        ) ?? false
      case "multiple-choice":
        return userAnswer === question.correctOptionIndex
      case "image-association":
        return question.associatedTerms?.some((term: string) => 
          term.toLowerCase() === userAnswer?.toLowerCase()
        ) ?? false
      default:
        return false
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!minigame || !questions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <Card className="p-6 text-center">
          <p>Loading minigame...</p>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const passed = score >= minigame.requiredScore
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <Card className="relative w-full max-w-2xl border-4 border-[var(--game-yellow)]/30 bg-gradient-to-br from-gray-900 via-[#0a0f0a] to-green-950 p-6 shadow-2xl">
          <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-2 right-2">
            <X className="h-6 w-6" />
          </Button>

          <div className="text-center">
            <div className="mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 mx-auto text-[var(--game-yellow)] mb-2" />
              ) : (
                <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold mb-2">
              {passed ? "🎉 Great Job!" : "😅 Try Again!"}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-4">
              {passed 
                ? `You scored ${score}% and passed!` 
                : `You scored ${score}%. Need ${minigame.requiredScore}% to pass.`
              }
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-[var(--game-yellow)]">{score}%</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-[var(--game-green)]">
                  {questions.filter((_, i) => isAnswerCorrect(questions[i], answers[i])).length}
                </div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 bg-[var(--game-green)] text-black font-bold hover:bg-[var(--game-yellow)]"
              onClick={() => onComplete(passed, score)}
            >
              {passed ? "Continue Quest" : "Retry Minigame"}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <Card className="relative w-full max-w-2xl border-4 border-[var(--game-yellow)]/30 bg-gradient-to-br from-gray-900 via-[#0a0f0a] to-green-950 p-6 shadow-2xl">
          <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-2 right-2">
            <X className="h-6 w-6" />
          </Button>

          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--game-yellow)] to-[var(--game-green)] bg-clip-text text-transparent mb-4">
              {minigame.title}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              {minigame.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-lg font-bold text-[var(--game-yellow)]">
                  {questions?.length ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-lg font-bold text-[var(--game-green)]">
                  {minigame.timeLimit ? formatTime(minigame.timeLimit) : "∞"}
                </div>
                <div className="text-sm text-muted-foreground">Time Limit</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-lg font-bold text-[var(--game-orange)]">
                  {minigame.requiredScore}%
                </div>
                <div className="text-sm text-muted-foreground">Required Score</div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 bg-[var(--game-green)] text-black font-bold hover:bg-[var(--game-yellow)]"
              onClick={() => setGameStarted(true)}
            >
              Start Minigame
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions?.[currentQuestionIndex]
  if (!currentQuestion) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="relative w-full max-w-4xl border-4 border-[var(--game-yellow)]/30 bg-gradient-to-br from-gray-900 via-[#0a0f0a] to-green-950 p-6 shadow-2xl">
        <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-2 right-2">
          <X className="h-6 w-6" />
        </Button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <p className="text-sm text-muted-foreground">
              {minigame.title}
            </p>
          </div>
          
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
              <Clock className="h-4 w-4 text-[var(--game-yellow)]" />
              <span className="font-mono text-lg font-bold text-[var(--game-yellow)]">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 h-2 overflow-hidden rounded-full border border-white/10 bg-black/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--game-yellow)] to-[var(--game-green)] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            {currentQuestion.questionText}
          </h4>

          {currentQuestion.questionType === "matching" && (
            <MatchingGame
              key={`matching-${currentQuestionIndex}`}
              question={currentQuestion}
              onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
            />
          )}

          {currentQuestion.questionType === "fill-in-blank" && (
            <FillInBlankGame
              key={`fill-in-blank-${currentQuestionIndex}`}
              question={currentQuestion}
              onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
            />
          )}

          {currentQuestion.questionType === "multiple-choice" && (
            <MultipleChoiceGame
              key={`multiple-choice-${currentQuestionIndex}`}
              question={currentQuestion}
              onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
            />
          )}

          {currentQuestion.questionType === "image-association" && (
            <ImageAssociationGame
              key={`image-association-${currentQuestionIndex}`}
              question={currentQuestion}
              onAnswer={(answer) => handleAnswer(currentQuestionIndex, answer)}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
