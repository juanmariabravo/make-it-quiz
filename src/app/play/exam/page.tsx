"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { loadQuizCategories } from "@/lib/quiz-data"
import type { QuizCategory, GameState } from "@/lib/types"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ExamModePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    timeRemaining: 0,
    isFinished: false,
  })
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [examDuration, setExamDuration] = useState(0)

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
    // Calcular duración del examen: 30 segundos por pregunta
    const duration = category.questions.length * 30

    setSelectedCategory(category)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(category.questions.length).fill(-1),
      timeRemaining: duration,
      isFinished: false,
    })

    setExamDuration(duration)
  }

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const submitAnswer = () => {
    if (selectedOption === null || !selectedCategory) return

    const newAnswers = [...gameState.answers]
    newAnswers[gameState.currentQuestion] = selectedOption

    setGameState({
      ...gameState,
      answers: newAnswers,
    })

    // Avanzar automáticamente a la siguiente pregunta
    nextQuestion()
  }

  const nextQuestion = () => {
    if (!selectedCategory) return

    const nextIndex = gameState.currentQuestion + 1

    if (nextIndex >= selectedCategory.questions.length) {
      finishExam()
    } else {
      setGameState({
        ...gameState,
        currentQuestion: nextIndex,
      })
      setSelectedOption(null)
    }
  }

  const prevQuestion = () => {
    if (!selectedCategory || gameState.currentQuestion <= 0) return

    setGameState({
      ...gameState,
      currentQuestion: gameState.currentQuestion - 1,
    })

    setSelectedOption(gameState.answers[gameState.currentQuestion - 1])
  }

  const finishExam = useCallback(() => {
    if (!selectedCategory) return

    // Calcular puntuación
    let totalScore = 0
    gameState.answers.forEach((answer, index) => {
      if (answer === selectedCategory.questions[index].answer) {
        totalScore += selectedCategory.questions[index].points || 1
      }
    })

    setGameState({
      ...gameState,
      score: totalScore,
      isFinished: true,
      timeRemaining: 0,
    })
  }, [gameState, selectedCategory])

  const restartQuiz = () => {
    if (!selectedCategory) return

    const duration = selectedCategory.questions.length * 30

    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(selectedCategory.questions.length).fill(-1),
      timeRemaining: duration,
      isFinished: false,
    })

    setSelectedOption(null)
    setExamDuration(duration)
  }

  const exitQuiz = () => {
    setSelectedCategory(null)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      timeRemaining: 0,
      isFinished: false,
    })
    setSelectedOption(null)
  }

  // Timer effect
  useEffect(() => {
    if (!selectedCategory || gameState.isFinished || !gameState.timeRemaining) return

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining && prev.timeRemaining > 1) {
          return { ...prev, timeRemaining: prev.timeRemaining - 1 }
        } else {
          clearInterval(timer)
          return { ...prev, timeRemaining: 0, isFinished: true }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedCategory, gameState.isFinished, gameState.timeRemaining])

  // Effect to finish exam when time runs out
  useEffect(() => {
    if (gameState.timeRemaining === 0 && !gameState.isFinished && selectedCategory) {
      finishExam()
    }
  }, [gameState.timeRemaining, gameState.isFinished, selectedCategory, finishExam])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
            <h1 className="text-3xl font-bold">Modo Examen</h1>
            <p className="mt-2 text-muted-foreground">
              Contrarreloj: responde a todas las preguntas antes de que se acabe el tiempo
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
                  <p className="text-muted-foreground">
                    {category.questions.length} preguntas • {Math.round((category.questions.length * 30) / 60)} minutos
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => startQuiz(category)} className="w-full bg-orange-600 hover:bg-orange-700">
                    Comenzar examen
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
    const isPassed = percentageScore >= 60 // 60% para aprobar

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-orange-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">¡Examen completado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Tu calificación</h3>
                <div className="text-4xl font-bold text-orange-600">
                  {gameState.score} / {totalPoints}
                </div>
                <div className="mt-2 text-lg">{percentageScore}%</div>

                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mt-4">
                  <div
                    className={`h-2.5 rounded-full ${isPassed ? "bg-green-600" : "bg-red-600"}`}
                    style={{ width: `${percentageScore}%` }}
                  ></div>
                </div>

                <div className={`mt-4 font-semibold ${isPassed ? "text-green-600" : "text-red-600"}`}>
                  {isPassed ? "¡APROBADO!" : "SUSPENSO"}
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

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Tiempo utilizado</h3>
                <div className="flex items-center justify-between">
                  <span>{formatTime(examDuration - (gameState.timeRemaining || 0))}</span>
                  <span className="text-muted-foreground">de {formatTime(examDuration)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={restartQuiz} className="w-full sm:w-auto">
                Reintentar
              </Button>
              <Button onClick={exitQuiz} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                Volver a categorías
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = selectedCategory.questions[gameState.currentQuestion]
  const questionNumber = gameState.currentQuestion + 1
  const totalQuestions = selectedCategory.questions.length
  const timePercentage = ((gameState.timeRemaining || 0) / examDuration) * 100

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={exitQuiz} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Salir del examen
          </Button>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className={`${timePercentage < 20 ? "text-red-600 animate-pulse" : "text-muted-foreground"}`}>
              {formatTime(gameState.timeRemaining || 0)}
            </span>
          </div>
        </div>

        <Card className="border-2 border-orange-500/20">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                {selectedCategory.name} • Pregunta {questionNumber} de {totalQuestions}
              </div>
              <div className="text-sm font-medium">
                {currentQuestion.points || 1} punto{(currentQuestion.points || 1) > 1 ? "s" : ""}
              </div>
            </div>

            <Progress value={timePercentage} className="h-2" />

            <CardTitle className="text-xl mt-4">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => handleOptionSelect(Number.parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevQuestion} disabled={gameState.currentQuestion === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={submitAnswer}
              disabled={selectedOption === null}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {gameState.currentQuestion === totalQuestions - 1 ? "Finalizar" : "Siguiente"}
              {gameState.currentQuestion !== totalQuestions - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Progreso: {questionNumber}/{totalQuestions} preguntas
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={finishExam}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            Terminar examen
          </Button>
        </div>
      </div>
    </div>
  )
}

// Función para formatear el tiempo en formato mm:ss
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}
