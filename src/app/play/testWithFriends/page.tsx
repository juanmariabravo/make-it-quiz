"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loadQuizCategories } from "@/lib/quiz-data"
import type { QuizCategory, Question } from "@/lib/types"

type Player = { id: string; name: string; score: number; answered: boolean }
type ServerMessage =
  | { type: "created" | "joined"; code: string }
  | { type: "room"; code: string; players: Player[]; hostId: string; phase: string }
  | { type: "question"; index: number; total: number; question: Omit<Question, "answer">; endsAt: number }
  | { type: "answer_feedback"; correct: boolean; points: number }
  | { type: "results"; correctAnswer: number; players: Player[]; lastQuestion: boolean }
  | { type: "finished"; players: Player[] }
  | { type: "error"; message: string }

const playerId = () => {
  const key = "make-it-quiz.player-id"
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const id = crypto.randomUUID()
  window.sessionStorage.setItem(key, id)
  return id
}

export default function PartyModePage() {
  const router = useRouter()
  const socket = useRef<WebSocket | null>(null)
  const id = useRef("")
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [category, setCategory] = useState<QuizCategory | null>(null)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [hostId, setHostId] = useState("")
  const [phase, setPhase] = useState<"setup" | "lobby" | "question" | "results" | "finished">("setup")
  const [question, setQuestion] = useState<ServerMessage & { type: "question" } | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState("")
  const [answerFeedback, setAnswerFeedback] = useState<{ correct: boolean; points: number } | null>(null)

  const me = id.current
  const isHost = me !== "" && me === hostId
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players])

  useEffect(() => {
    id.current = playerId()
    setCode(new URLSearchParams(window.location.search).get("room") || "")
    loadQuizCategories().then(setCategories).catch(() => setError("No se pudieron cargar los tests."))
    return () => socket.current?.close()
  }, [])

  const connect = (action: { type: "create"; questions: Question[] } | { type: "join"; code: string }) => {
    if (!name.trim()) return setError("Introduce tu nombre antes de continuar.")
    setError("")
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`)
    socket.current = ws
    ws.onopen = () => ws.send(JSON.stringify({ ...action, playerId: id.current, name: name.trim() }))
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerMessage
      if (message.type === "created" || message.type === "joined") {
        setRoomCode(message.code)
        setPhase("lobby")
        window.history.replaceState(null, "", `/play/testWithFriends?room=${message.code}`)
      } else if (message.type === "room") {
        setRoomCode(message.code)
        setPlayers(message.players)
        setHostId(message.hostId)
        if (message.phase === "lobby") setPhase("lobby")
      } else if (message.type === "question") {
        setQuestion(message)
        setSelectedAnswer(null)
        setCorrectAnswer(null)
        setAnswerFeedback(null)
        setPhase("question")
      } else if (message.type === "answer_feedback") {
        setAnswerFeedback({ correct: message.correct, points: message.points })
      } else if (message.type === "results") {
        setPlayers(message.players)
        setCorrectAnswer(message.correctAnswer)
        setPhase("results")
      } else if (message.type === "finished") {
        setPlayers(message.players)
        setPhase("finished")
      } else if (message.type === "error") setError(message.message)
    }
    ws.onerror = () => setError("No se pudo conectar con el servidor de partidas.")
    ws.onclose = () => { if (phase !== "finished") setError("La conexión con la sala se ha cerrado.") }
  }

  useEffect(() => {
    if (!question || phase !== "question") return
    const update = () => setTimeLeft(Math.max(0, Math.ceil((question.endsAt - Date.now()) / 1000)))
    update()
    const timer = window.setInterval(update, 250)
    return () => window.clearInterval(timer)
  }, [question, phase])

  const send = (message: object) => socket.current?.send(JSON.stringify({ ...message, code: roomCode, playerId: me }))

  if (phase === "setup") {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <Button variant="outline" onClick={() => router.push("/play")}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
        <h1 className="mt-8 text-center text-3xl font-bold">Modo Fiesta</h1>
        <p className="mt-2 text-center text-muted-foreground">Crea una sala o únete con un código. Todos jugarán en tiempo real.</p>
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        <div className="mx-auto mt-8 max-w-md space-y-4">
          <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Card>
            <CardHeader><CardTitle>Crear una sala</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <select className="w-full rounded-md border bg-background px-3 py-2" value={category?.id || ""} onChange={(e) => setCategory(categories.find((item) => item.id === e.target.value) || null)}>
                <option value="">Selecciona un test</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <Button className="w-full bg-pink-600 hover:bg-pink-700" disabled={!category} onClick={() => connect({ type: "create", questions: category!.questions })}>Crear sala</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Unirse a una sala</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Código de 6 cifras" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              <Button variant="outline" className="w-full" disabled={code.length !== 6} onClick={() => connect({ type: "join", code })}>Unirse</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (phase === "lobby") {
    const link = typeof window === "undefined" ? "" : `${window.location.origin}/play/testWithFriends?room=${roomCode}`
    return (
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center"><CardTitle>Esperando jugadores</CardTitle><p className="text-muted-foreground">Comparte este código o enlace</p></CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-3"><span className="text-5xl font-bold tracking-widest text-pink-600">{roomCode}</span><Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(link)}><Copy className="h-4 w-4" /></Button></div>
            <div className="space-y-2"><p className="font-semibold"><Users className="mr-2 inline h-4 w-4" />{players.length} jugadores</p>{players.map((player) => <p key={player.id}>{player.name}{player.id === hostId ? " (anfitrión)" : ""}</p>)}</div>
            {error && <p className="text-red-600">{error}</p>}
          </CardContent>
          {isHost && <CardFooter><Button className="w-full bg-pink-600 hover:bg-pink-700" disabled={players.length < 1} onClick={() => send({ type: "start" })}>Comenzar partida</Button></CardFooter>}
        </Card>
      </main>
    )
  }

  if (phase === "question" && question) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-4 flex justify-between text-sm text-muted-foreground"><span>Pregunta {question.index + 1} de {question.total}</span><span className="font-bold text-pink-600">{timeLeft}s</span></div>
        <Card><CardHeader><CardTitle>{question.question.question}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{question.question.options.map((option, index) => <Button key={`${question.index}-${index}`} variant={selectedAnswer === index ? "default" : "outline"} className="h-auto min-h-16 whitespace-normal p-4 text-left" disabled={selectedAnswer !== null || timeLeft === 0} onClick={() => { setSelectedAnswer(index); send({ type: "answer", answer: index }) }}>{option}</Button>)}</CardContent></Card>
        <p className="mt-4 text-center text-muted-foreground">{selectedAnswer === null ? "Elige una respuesta" : "Respuesta enviada. Espera al resto..."}</p>
      </main>
    )
  }

  if (phase === "results") {
    return <Results players={sortedPlayers} correctAnswer={correctAnswer} answerFeedback={answerFeedback} isHost={isHost} onNext={() => send({ type: "next" })} />
  }

  return <Results players={sortedPlayers} correctAnswer={null} finished />
}

function Results({ players, correctAnswer, answerFeedback, isHost, onNext, finished = false }: { players: Player[]; correctAnswer: number | null; answerFeedback?: { correct: boolean; points: number } | null; isHost?: boolean; onNext?: () => void; finished?: boolean }) {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <Card className="border-2 border-pink-500/20">
        <CardHeader className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
          <CardTitle className="text-2xl">{finished ? "¡Juego terminado!" : "Resultados de la pregunta"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!finished && answerFeedback && (
            <div className={`rounded-lg p-4 text-center ${answerFeedback.correct ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
              <p className="text-xl font-bold">{answerFeedback.correct ? "¡Has acertado!" : "No has acertado"}</p>
              <p>{answerFeedback.correct ? `Has conseguido ${answerFeedback.points} puntos.` : correctAnswer !== null ? `La respuesta correcta era la opción ${correctAnswer + 1}.` : "La respuesta no era correcta."}</p>
            </div>
          )}
          <div className="rounded-lg bg-pink-50 p-4 dark:bg-pink-900/20">
            <h3 className="mb-4 text-center text-xl font-semibold">Clasificación {finished ? "final" : "actual"}</h3>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id} className={`flex items-center justify-between rounded-lg p-3 ${index === 0 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-gray-50 dark:bg-gray-800"}`}>
                  <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 font-bold text-white">{index + 1}</span><span className="font-semibold">{player.name}</span></div>
                  <span className="font-semibold">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        {!finished && isHost && <CardFooter><Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={onNext}>Siguiente pregunta</Button></CardFooter>}
      </Card>
    </main>
  )
}
