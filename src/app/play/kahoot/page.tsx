"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loadQuizCategories } from "@/lib/quiz-data"
import type { QuizCategory, GameState } from "@/lib/types"
import { ArrowLeft, Users, Trophy, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function KahootModePage() {
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
  const [players, setPlayers] = useState<{ id: number; name: string; score: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [questionTimer, setQuestionTimer] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

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
    // Generar jugadores simulados
    const simulatedPlayers = [
      { id: 1, name: "Jugador 1", score: 0 },
      { id: 2, name: "Jugador 2", score: 0 },
      { id: 3, name: "Jugador 3", score: 0 },
    ]

    setSelectedCategory(category)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(category.questions.length).fill(-1),
      timeRemaining: 15, // 15 segundos por pregunta
      isFinished: false,
    })

    setPlayers([{ id: 0, name: "Tú", score: 0 }, ...simulatedPlayers])

    // Iniciar cuenta atrás
    setCountdownValue(3)
    const countdownInterval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev > 1) {
          return prev - 1
        } else {
          clearInterval(countdownInterval)
          setShowQuestion(true)
          return 0
        }
      })
    }, 1000)
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (!selectedCategory || selectedAnswers[0] !== undefined) return

    const timeLeft = gameState.timeRemaining || 0
    const maxPoints = 1000
    const points = Math.round((timeLeft / 15) * maxPoints)

    const isCorrect = optionIndex === selectedCategory.questions[gameState.currentQuestion].answer
    const earnedPoints = isCorrect ? points : 0

    // Actualizar puntuación del jugador
    setPlayers((prev) => {
      const updated = [...prev]
      updated[0].score += earnedPoints
      return updated
    })

    // Registrar respuesta
    setSelectedAnswers({
      ...selectedAnswers,
      0: optionIndex,
    })

    // Simular respuestas de otros jugadores
    setTimeout(() => {
      const updatedAnswers = { ...selectedAnswers, 0: optionIndex }

      players.forEach((player, index) => {
        if (index === 0) return // Saltar al jugador real

        const randomDelay = Math.random() * 5000 // Respuesta en 0-5 segundos

        setTimeout(() => {
          // 70% de probabilidad de respuesta correcta para simular competencia
          const correctAnswer = selectedCategory.questions[gameState.currentQuestion].answer
          const willAnswerCorrectly = Math.random() < 0.7
          const playerAnswer = willAnswerCorrectly ? correctAnswer : Math.floor(Math.random() * 4)

          const timeRemaining = Math.max(0, (gameState.timeRemaining || 0) - randomDelay / 1000)
          const playerPoints = willAnswerCorrectly ? Math.round((timeRemaining / 15) * maxPoints) : 0

          setPlayers((prev) => {
            const updated = [...prev]
            updated[index].score += playerPoints
            return updated
          })

          setSelectedAnswers((prev) => ({
            ...prev,
            [index]: playerAnswer,
          }))
        }, randomDelay)
      })
    }, 500)
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
      setShowResults(false)
      setShowQuestion(false)
      setSelectedAnswers({})

      setGameState({
        ...gameState,
        currentQuestion: nextIndex,
        timeRemaining: 15,
      })

      // Iniciar cuenta atrás para la siguiente pregunta
      setCountdownValue(3)
      const countdownInterval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev > 1) {
            return prev - 1
          } else {
            clearInterval(countdownInterval)
            setShowQuestion(true)
            return 0
          }
        })
      }, 1000)
    }
  }

  const showQuestionResults = () => {
    setShowQuestion(false)
    setShowResults(true)
  }

  const restartQuiz = () => {
    if (!selectedCategory) return

    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(selectedCategory.questions.length).fill(-1),
      timeRemaining: 15,
      isFinished: false,
    })

    setPlayers(players.map((player) => ({ ...player, score: 0 })))
    setSelectedAnswers({})
    setShowQuestion(false)
    setShowResults(false)

    // Iniciar cuenta atrás
    setCountdownValue(3)
    const countdownInterval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev > 1) {
          return prev - 1
        } else {
          clearInterval(countdownInterval)
          setShowQuestion(true)
          return 0
        }
      })
    }, 1000)
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
    setPlayers([])
    setSelectedAnswers({})
    setShowQuestion(false)
    setShowResults(false)
  }

  // Timer effect para la pregunta
  useEffect(() => {
    if (!showQuestion || !selectedCategory || gameState.isFinished) return

    setQuestionTimer(15)
    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev > 1) {
          return prev - 1
        } else {
          clearInterval(timer)
          showQuestionResults()
          return 0
        }
      })

      setGameState((prev) => ({
        ...prev,
        timeRemaining: (prev.timeRemaining || 0) > 0 ? (prev.timeRemaining || 0) - 1 : 0,
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [showQuestion, selectedCategory, gameState.isFinished])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
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
            <h1 className="text-3xl font-bold">Modo Kahoot</h1>
            <p className="mt-2 text-muted-foreground">Compite con amigos por puntos en tiempo real</p>
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
                  <Button onClick={() => startQuiz(category)} className="w-full bg-pink-600 hover:bg-pink-700">
                    Iniciar juego
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
    // Ordenar jugadores por puntuación
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    const userRank = sortedPlayers.findIndex((p) => p.id === 0) + 1

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-pink-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">¡Juego terminado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <Trophy className="h-12 w-12 text-yellow-500 mb-2" />
                <h3 className="text-xl font-semibold mb-2">Clasificación final</h3>

                <div className="w-full max-w-md mt-4 space-y-3">
                  {sortedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.id === 0
                          ? "bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700"
                          : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                                ? "bg-gray-300 text-gray-800"
                                : index === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className={player.id === 0 ? "font-bold" : ""}>{player.name}</span>
                      </div>
                      <span className="font-semibold">{player.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Tu resultado</h3>
                <div className="text-lg">
                  Posición: <span className="font-bold text-pink-600">{userRank}º</span> de {players.length}
                </div>
                <div className="text-lg">
                  Puntuación: <span className="font-bold text-pink-600">{players[0].score}</span> puntos
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={restartQuiz} className="w-full sm:w-auto">
                Jugar de nuevo
              </Button>
              <Button onClick={exitQuiz} className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700">
                Volver a categorías
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (!showQuestion && !showResults) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Preparados...</h2>
          <div className="text-6xl font-bold text-pink-600 animate-pulse">{countdownValue}</div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const currentQuestion = selectedCategory.questions[gameState.currentQuestion]
    const correctAnswer = currentQuestion.answer
    const optionCounts = currentQuestion.options.map(
      (_, index) => Object.values(selectedAnswers).filter((a) => a === index).length,
    )
    const totalAnswers = Object.keys(selectedAnswers).length

    // Ordenar jugadores por puntuación
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      index === correctAnswer
                        ? "bg-green-100 dark:bg-green-900/30 border border-green-300"
                        : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={index === correctAnswer ? "font-bold" : ""}>{option}</span>
                      {index === correctAnswer && <span className="text-green-600 font-bold">✓ Correcta</span>}
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${index === correctAnswer ? "bg-green-600" : "bg-gray-400"}`}
                        style={{ width: `${totalAnswers > 0 ? (optionCounts[index] / totalAnswers) * 100 : 0}%` }}
                      ></div>
                    </div>

                    <div className="text-sm mt-1 text-right">
                      {optionCounts[index]} (
                      {totalAnswers > 0 ? Math.round((optionCounts[index] / totalAnswers) * 100) : 0}%)
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3">Clasificación actual</h3>

                <div className="space-y-2">
                  {sortedPlayers.slice(0, 3).map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        player.id === 0 ? "bg-pink-100 dark:bg-pink-900/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className={player.id === 0 ? "font-bold" : ""}>{player.name}</span>
                      </div>
                      <span className="font-semibold">{player.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={nextQuestion} className="w-full bg-pink-600 hover:bg-pink-700">
                {gameState.currentQuestion === selectedCategory.questions.length - 1
                  ? "Ver resultados finales"
                  : "Siguiente pregunta"}
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
  const timePercentage = (questionTimer / 15) * 100

  // Colores para las opciones
  const optionColors = [
    { bg: "bg-red-500", hover: "hover:bg-red-600" },
    { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
    { bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
    { bg: "bg-green-500", hover: "hover:bg-green-600" },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCategory.name} • Pregunta {questionNumber} de {totalQuestions}
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-pink-600" />
            <span className={`${timePercentage < 20 ? "text-red-600 animate-pulse" : ""}`}>{questionTimer}s</span>
          </div>
        </div>

        <div className="mb-8">
          <Progress value={timePercentage} className="h-3" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswers[0] !== undefined}
              className={`h-24 text-lg font-semibold text-white ${optionColors[index].bg} ${optionColors[index].hover} ${
                selectedAnswers[0] === index ? "ring-4 ring-white ring-opacity-50" : ""
              }`}
            >
              {option}
            </Button>
          ))}
        </div>

        {selectedAnswers[0] !== undefined && (
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">Esperando a otros jugadores...</p>
          </div>
        )}

        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={exitQuiz} className="text-pink-600 border-pink-600 hover:bg-pink-50">
            Abandonar juego
          </Button>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{players.length} jugadores</span>
          </div>
        </div>
      </div>
    </div>
  )
}
