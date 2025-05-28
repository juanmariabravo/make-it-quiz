"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { loadQuizCategories } from "@/lib/quiz-data"
import type { QuizCategory, GameState } from "@/lib/types"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"

export default function StudyModePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    isFinished: false,
  })
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await loadQuizCategories()
        setCategories(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading quiz categories:", error)
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const startQuiz = (category: QuizCategory) => {
    setSelectedCategory(category)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(category.questions.length).fill(-1),
      isFinished: false,
    })
  }

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const submitAnswer = () => {
    if (selectedOption === null || !selectedCategory) return

    const currentQuestion = selectedCategory.questions[gameState.currentQuestion]
    const isCorrect = selectedOption === currentQuestion.answer
    const points = currentQuestion.points || 1

    const newAnswers = [...gameState.answers]
    newAnswers[gameState.currentQuestion] = selectedOption

    setGameState({
      ...gameState,
      score: isCorrect ? gameState.score + points : gameState.score,
      answers: newAnswers,
    })

    setShowFeedback(true)
  }

  const nextQuestion = () => {
    if (!selectedCategory) return

    const nextIndex = gameState.currentQuestion + 1

    if (nextIndex >= selectedCategory.questions.length) {
      setGameState({
        ...gameState,
        isFinished: true,
      })
    } else {
      setGameState({
        ...gameState,
        currentQuestion: nextIndex,
      })
      setSelectedOption(null)
      setShowFeedback(false)
    }
  }

  const prevQuestion = () => {
    if (!selectedCategory || gameState.currentQuestion <= 0) return

    setGameState({
      ...gameState,
      currentQuestion: gameState.currentQuestion - 1,
    })

    setSelectedOption(gameState.answers[gameState.currentQuestion - 1])
    setShowFeedback(true)
  }

  const restartQuiz = () => {
    if (!selectedCategory) return

    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(selectedCategory.questions.length).fill(-1),
      isFinished: false,
    })

    setSelectedOption(null)
    setShowFeedback(false)
  }

  const exitQuiz = () => {
    setSelectedCategory(null)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      isFinished: false,
    })
    setSelectedOption(null)
    setShowFeedback(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando categorías...</p>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Modo Estudio</h1>
            <p className="mt-2 text-muted-foreground">
              Estudia a tu ritmo y comprueba tus respuestas tras contestar cada pregunta
            </p>
          </div>

          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push("/play")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a modos de juego
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{category.questions.length} preguntas</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => startQuiz(category)} className="w-full bg-purple-600 hover:bg-purple-700">
                    Comenzar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (gameState.isFinished) {
    const totalQuestions = selectedCategory.questions.length
    const totalPoints = selectedCategory.questions.reduce((sum, q) => sum + (q.points || 1), 0)
    const percentageScore = Math.round((gameState.score / totalPoints) * 100)

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-purple-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">¡Quiz completado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Tu puntuación</h3>
                <div className="text-4xl font-bold text-purple-600">
                  {gameState.score} / {totalPoints}
                </div>
                <div className="mt-2 text-lg">{percentageScore}%</div>

                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mt-4">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${percentageScore}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <div className="text-xl font-semibold text-green-600">
                    {gameState.answers.filter((a, i) => a === selectedCategory.questions[i].answer).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Correctas</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <div className="text-xl font-semibold text-red-600">
                    {gameState.answers.filter((a, i) => a !== -1 && a !== selectedCategory.questions[i].answer).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrectas</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={restartQuiz} className="w-full sm:w-auto">
                Reintentar
              </Button>
              <Button onClick={exitQuiz} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                Volver a categorías
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = selectedCategory.questions[gameState.currentQuestion]
  const isCorrect = selectedOption === currentQuestion.answer
  const questionNumber = gameState.currentQuestion + 1
  const totalQuestions = selectedCategory.questions.length

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={exitQuiz} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a categorías
          </Button>

          <div className="text-sm text-muted-foreground">
            {selectedCategory.name} • Pregunta {questionNumber} de {totalQuestions}
          </div>
        </div>

        <Card className="border-2 border-purple-500/20">
          <CardHeader>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-purple-600 h-1.5 rounded-full"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <CardTitle className="text-xl mt-4">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              key={`question-${gameState.currentQuestion}`}
              value={selectedOption?.toString()}
              onValueChange={(value) => handleOptionSelect(Number.parseInt(value))}
              className="space-y-3"
              disabled={showFeedback}
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    showFeedback && index === currentQuestion.answer
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : showFeedback && index === selectedOption && index !== currentQuestion.answer
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {showFeedback && index === currentQuestion.answer && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                  {showFeedback && index === selectedOption && index !== currentQuestion.answer && (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>

            {showFeedback && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  isCorrect
                    ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                }`}
              >
                <div className="font-medium mb-1">{isCorrect ? "¡Correcto!" : "Incorrecto"}</div>
                <div className="text-sm text-muted-foreground">
                  {isCorrect
                    ? `Has ganado ${currentQuestion.points || 1} punto${(currentQuestion.points || 1) > 1 ? "s" : ""}.`
                    : `La respuesta correcta era: ${currentQuestion.options[currentQuestion.answer]}`}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevQuestion} disabled={gameState.currentQuestion === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {!showFeedback ? (
              <Button
                onClick={submitAnswer}
                disabled={selectedOption === null}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Comprobar
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="bg-purple-600 hover:bg-purple-700">
                {gameState.currentQuestion === totalQuestions - 1 ? "Finalizar" : "Siguiente"}
                {gameState.currentQuestion !== totalQuestions - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Puntuación actual: <span className="font-medium">{gameState.score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
