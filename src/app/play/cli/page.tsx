"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loadQuizCategories } from "@/lib/quiz-data"
import type { QuizCategory, GameState } from "@/lib/types"
import { ArrowLeft, Terminal } from "lucide-react"

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
  const terminalRef = useRef<HTMLDivElement>(null)

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

    // Mostrar la primera pregunta
    showQuestion(0)
  }

  const showQuestion = async (index: number) => {
    if (!selectedCategory) return

    const question = selectedCategory.questions[index]
    const questionNumber = index + 1

    await addTerminalLine(`Pregunta ${questionNumber}/${selectedCategory.questions.length}:`)
    await addTerminalLine(`> ${question.question}`)
    await addTerminalLine("")

    question.options.forEach((option, i) => {
      addTerminalLine(`  ${i + 1}) ${option}`)
    })

    await addTerminalLine("")
    await addTerminalLine("Introduce el número de tu respuesta (1-" + question.options.length + "):")

    setWaitingForInput(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
  }

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

    const currentQuestion = selectedCategory.questions[gameState.currentQuestion]
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
    newAnswers[gameState.currentQuestion] = answerIndex

    setGameState({
      ...gameState,
      score: isCorrect ? gameState.score + points : gameState.score,
      answers: newAnswers,
    })

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
    const nextIndex = gameState.currentQuestion + 1

    if (nextIndex >= selectedCategory.questions.length) {
      finishQuiz()
    } else {
      await addTerminalLine("Presiona ENTER para continuar...")
      setWaitingForInput(true)

      // Configurar para que la próxima entrada avance a la siguiente pregunta
      setGameState({
        ...gameState,
        currentQuestion: nextIndex,
      })
    }
  }

  const handleContinue = async () => {
    if (!selectedCategory) return

    setUserInput("")
    await addTerminalLine("$ ")
    await addTerminalLine("")

    // Si estamos esperando para continuar a la siguiente pregunta
    if (waitingForInput && gameState.currentQuestion < selectedCategory.questions.length) {
      setWaitingForInput(false)
      showQuestion(gameState.currentQuestion)
    }
  }

  const finishQuiz = async () => {
    if (!selectedCategory) return

    setWaitingForInput(false)

    const totalQuestions = selectedCategory.questions.length
    const totalPoints = selectedCategory.questions.reduce((sum, q) => sum + (q.points || 1), 0)
    const correctAnswers = gameState.answers.filter((a, i) => a === selectedCategory.questions[i].answer).length
    const percentageScore = Math.round((gameState.score / totalPoints) * 100)

    await addTerminalLine("┌─────────────────────────────────────┐")
    await addTerminalLine("│ Resultados del cuestionario         │")
    await addTerminalLine("└─────────────────────────────────────┘")
    await addTerminalLine("")
    await addTerminalLine(`Categoría: ${selectedCategory.name}`)
    await addTerminalLine(`Preguntas: ${totalQuestions}`)
    await addTerminalLine(`Correctas: ${correctAnswers}/${totalQuestions}`)
    await addTerminalLine(`Puntuación: ${gameState.score}/${totalPoints} (${percentageScore}%)`)
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
    setGameState({
      ...gameState,
      isFinished: true,
    })
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
      <div className="container mx-auto px-4 py-12">
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

        <Card className="border-2 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4 bg-black text-white">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <CardTitle className="text-sm font-mono">make-it-quiz-cli</CardTitle>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={terminalRef} className="bg-black text-green-400 font-mono text-sm p-4 h-[400px] overflow-y-auto">
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
  )
}
