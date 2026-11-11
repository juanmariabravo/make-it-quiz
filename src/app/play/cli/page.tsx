"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateQuizScore, countCorrectAnswers, loadQuizCategories } from "@/lib/quiz-data"
import type { QuizCategory, GameState } from "@/lib/types"
import { ArrowLeft, Maximize2, Minimize2, Terminal } from "lucide-react"

export default function CliModePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    isFinished: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [userInput, setUserInput] = useState("")
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [showPrompt, setShowPrompt] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === fullscreenRef.current)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!fullscreenRef.current) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await fullscreenRef.current.requestFullscreen()
      }
    } catch (error) {
      console.error("No se pudo cambiar el modo de pantalla completa:", error)
    }
  }

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

  useEffect(() => {
    // Scroll al final del terminal cuando se añaden nuevas líneas
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  const addTerminalLine = (line: string, delay = 50) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, line])
        resolve()
      }, delay)
    })
  }

  const clearTerminal = () => {
    setTerminalLines([])
  }

  // Al seleccionar categoría y empezar el quiz
  const startQuiz = async (category: QuizCategory) => {
    setSelectedCategory(category)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: Array(category.questions.length).fill(-1),
      isFinished: false,
    })

    clearTerminal()

    await addTerminalLine("$ make-it-quiz --mode=cli")
    await addTerminalLine("")
    await addTerminalLine("┌─────────────────────────────────────┐")
    await addTerminalLine("│ make-it-quiz CLI v1.0.0             │")
    await addTerminalLine("│ Modo terminal para los más técnicos │")
    await addTerminalLine("└─────────────────────────────────────┘")
    await addTerminalLine("")
    await addTerminalLine(`Cargando categoría: ${category.name}...`)
    await addTerminalLine(`Encontradas ${category.questions.length} preguntas.`)
    await addTerminalLine("")
    await addTerminalLine("Iniciando cuestionario...")
    await addTerminalLine("")

    await showQuestion(0, category)
  }

  // Mostrar pregunta
  const showQuestion = async (index: number, category: QuizCategory) => {
    const question = category.questions[index]
    const questionNumber = index + 1

    await addTerminalLine(`Pregunta ${questionNumber}/${category.questions.length}:`)
    await addTerminalLine(`> ${question.question}`)
    await addTerminalLine("")

    question.options.forEach((option, i) => {
      addTerminalLine(`  ${i + 1}) ${option}`)
    })

    await addTerminalLine("")
    await addTerminalLine("Introduce el número de tu respuesta (1-" + question.options.length + "):")

    setWaitingForInput(true)
  }

  // Cuando el usuario escribe en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
  }

  // Cuando el usuario envía una respuesta
  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitingForInput || !selectedCategory) return

    const input = userInput.trim()
    setUserInput("")

    // Añadir la entrada del usuario al terminal
    await addTerminalLine(`$ ${input}`)

    // Procesar la entrada
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "salir") {
      await addTerminalLine("Saliendo del cuestionario...")
      exitQuiz()
      return
    }

    const currentQuestionIndex = gameState.currentQuestion
    const currentQuestion = selectedCategory.questions[currentQuestionIndex]
    const answerIndex = Number.parseInt(input) - 1

    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= currentQuestion.options.length) {
      await addTerminalLine("Entrada no válida. Introduce un número entre 1 y " + currentQuestion.options.length + ":")
      return
    }

    setWaitingForInput(false)

    // Comprobar respuesta
    const isCorrect = answerIndex === currentQuestion.answer
    const points = currentQuestion.points || 1

    const newAnswers = [...gameState.answers]
    newAnswers[currentQuestionIndex] = answerIndex

    const newScore = calculateQuizScore(selectedCategory.questions, newAnswers)

    setGameState((previous) => ({
      ...previous,
      score: newScore,
      answers: newAnswers,
    }))

    // Mostrar resultado
    await addTerminalLine("")
    if (isCorrect) {
      await addTerminalLine("✓ ¡Correcto! +" + points + " punto" + (points > 1 ? "s" : ""))
    } else {
      await addTerminalLine(
        "✗ Incorrecto. La respuesta correcta era: " + currentQuestion.options[currentQuestion.answer],
      )
    }
    await addTerminalLine("")

    // Avanzar a la siguiente pregunta o finalizar
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= selectedCategory.questions.length) {
      finishQuiz(newAnswers)
    } else {
      await addTerminalLine("Presiona ENTER para continuar...")
      setWaitingForInput(true)

      // Configurar para que la próxima entrada avance a la siguiente pregunta
      setGameState((previous) => ({ ...previous, currentQuestion: nextIndex }))
    }
  }

  // Cuando se espera continuar
  const handleContinue = async () => {
    if (!selectedCategory) return

    setUserInput("")
    await addTerminalLine("$ ")
    await addTerminalLine("")

    // Si estamos esperando para continuar a la siguiente pregunta
    if (waitingForInput && gameState.currentQuestion < selectedCategory.questions.length) {
      setWaitingForInput(false)
      showQuestion(gameState.currentQuestion, selectedCategory)
    }
  }

  // Al finalizar el quiz
  const finishQuiz = async (answersParam?: number[]) => {
    if (!selectedCategory) return

    setWaitingForInput(false)

    const answers = answersParam ?? gameState.answers
    const totalQuestions = selectedCategory.questions.length
    const totalPoints = selectedCategory.questions.reduce((sum, q) => sum + (q.points || 1), 0)
    const correctAnswers = countCorrectAnswers(selectedCategory.questions, answers)
    const score = calculateQuizScore(selectedCategory.questions, answers)
    const percentageScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0

    await addTerminalLine("┌─────────────────────────────────────┐")
    await addTerminalLine("│ Resultados del cuestionario         │")
    await addTerminalLine("└─────────────────────────────────────┘")
    await addTerminalLine("")
    await addTerminalLine(`Categoría: ${selectedCategory.name}`)
    await addTerminalLine(`Preguntas: ${totalQuestions}`)
    await addTerminalLine(`Correctas: ${correctAnswers}/${totalQuestions}`)
    await addTerminalLine(`Puntuación: ${score}/${totalPoints} (${percentageScore}%)`)
    await addTerminalLine("")

    if (percentageScore >= 80) {
      await addTerminalLine("¡Excelente trabajo! Dominas este tema.")
    } else if (percentageScore >= 60) {
      await addTerminalLine("Buen trabajo. Puedes mejorar un poco más.")
    } else {
      await addTerminalLine("Necesitas estudiar más este tema.")
    }

    await addTerminalLine("")
    await addTerminalLine("Opciones disponibles:")
    await addTerminalLine("  1) Reintentar cuestionario")
    await addTerminalLine("  2) Volver a categorías")
    await addTerminalLine("")
    await addTerminalLine("Introduce tu elección (1-2):")

    setWaitingForInput(true)
    setGameState((previous) => ({
      ...previous,
      score,
      isFinished: true,
    }))
  }

  const handleFinishOptions = async (input: string) => {
    const option = Number.parseInt(input.trim())

    if (option === 1) {
      // Reintentar cuestionario
      await addTerminalLine("Reiniciando cuestionario...")
      await addTerminalLine("")

      if (selectedCategory) {
        startQuiz(selectedCategory)
      }
    } else if (option === 2) {
      // Volver a categorías
      await addTerminalLine("Volviendo a categorías...")
      exitQuiz()
    } else {
      await addTerminalLine("Opción no válida. Introduce 1 o 2:")
    }
  }

  const exitQuiz = () => {
    setSelectedCategory(null)
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      isFinished: false,
    })
    setTerminalLines([])
    setUserInput("")
    setWaitingForInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (gameState.isFinished) {
        handleFinishOptions(userInput)
        setUserInput("")
      } else if (userInput.trim() === "") {
        handleContinue()
      } else {
        handleInputSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando categorías...</p>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className={`${isFullscreen ? "flex min-h-screen items-center bg-gray-950 p-4 sm:p-8" : "container mx-auto px-4 py-12"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Modo CLI</h1>
            <p className="mt-2 text-muted-foreground">Experiencia en línea de comandos para los más técnicos</p>
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
                  <Button onClick={() => startQuiz(category)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Iniciar CLI
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={exitQuiz} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Salir del CLI
          </Button>

          <div className="text-sm text-muted-foreground">{selectedCategory.name} • Modo CLI</div>
        </div>

        <div ref={fullscreenRef} className={isFullscreen ? "mx-auto w-full max-w-6xl rounded-xl bg-gray-950 p-4 sm:p-8" : undefined}>
        <Card className={`border-2 border-emerald-500/20 ${isFullscreen ? "shadow-2xl" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4 bg-black text-white">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <CardTitle className="text-sm font-mono">make-it-quiz-cli</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-7 w-7 text-white hover:bg-white/15 hover:text-white"
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
                title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={terminalRef} className={`bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto ${isFullscreen ? "h-[calc(100vh-7rem)]" : "h-[400px]"}`}>
              {terminalLines.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
              {waitingForInput && showPrompt && (
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none flex-1 text-green-400 font-mono text-sm"
                    autoFocus
                  />
                  <span className="animate-pulse">▌</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-900 text-white text-xs p-2">
            <div className="flex justify-between w-full">
              <span>Tip: Escribe "exit" o "salir" para salir del cuestionario</span>
              <span>{selectedCategory.name}</span>
            </div>
          </CardFooter>
        </Card>
        </div>
      </div>
    </div>
  )
}
