"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownToLine, ArrowLeft, Download, ExternalLink, Plus, Sparkles, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { deleteCustomQuiz, loadQuizCategories, parseJsonQuestions, parseTxtQuestions, saveCustomQuiz } from "@/lib/quiz-data"
import type { Question, QuizCategory } from "@/lib/types"

const emptyQuestion = (): Question => ({
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  points: 1,
})

const template = {
  id: "mi-test",
  name: "Mi test",
  questions: [
    {
      question: "¿Cuál es la respuesta correcta?",
      options: ["Opción A", "Opción B", "Opción C", "Opción D"],
      answer: 0,
      points: 1,
    },
  ],
}

const txtTemplate = `¿Cuál es la respuesta correcta?
a) Opción A
b) Opción B
c) Opción C
d) Opción D
Solución: a)
Puntos: 1

¿Cuál es la segunda pregunta?
a) Opción A
b) Opción B
c) Opción C
d) Opción D
Solución: c)
Puntos: 2`

const aiPrompt = (content: string) => `¿Tienes un test con un formato distinto? Transforma el contenido que te proporcionaré al siguiente formato JSON válido para make-it-quiz.

Reglas:
- Devuelve únicamente JSON válido, sin markdown ni explicaciones.
- Usa exactamente esta estructura: {"id":"mi-test","name":"Nombre del test","questions":[{"question":"...","options":["...","..."],"answer":0,"points":1}]}
- "answer" es el índice numérico de la opción correcta, empezando en 0.
- Conserva todas las preguntas y opciones. Si no hay puntos indicados, usa 1.
- No inventes respuestas: si una pregunta no tiene respuesta correcta identificable, indícalo después del JSON.

Plantilla de referencia:
${JSON.stringify(template, null, 2)}

Contenido del test a transformar:
${content || "[Pega aquí el contenido original del test]"}` 

export default function TestsPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"create" | "import">("create")
  const [name, setName] = useState("")
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()])
  const [fileName, setFileName] = useState("")
  const [importText, setImportText] = useState("")
  const [message, setMessage] = useState("")
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const refreshCategories = async () => {
    try {
      setCategories(await loadQuizCategories())
    } catch (error) {
      console.error("Error loading quiz categories:", error)
      setMessage("No se pudieron cargar los tests. Comprueba que el catálogo de preguntas esté generado.")
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [])

  const updateQuestion = (index: number, update: Partial<Question>) => {
    setQuestions((current) => current.map((question, itemIndex) =>
      itemIndex === index ? { ...question, ...update } : question,
    ))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question
      const options = [...question.options]
      options[optionIndex] = value
      return { ...question, options }
    }))
  }

  const createQuiz = () => {
    const cleanName = name.trim()
    const validQuestions = questions.every((question) =>
      question.question.trim() &&
      question.options.length >= 2 &&
      question.options.every((option) => option.trim()) &&
      question.answer >= 0 &&
      question.answer < question.options.length,
    )
    if (!cleanName || !validQuestions) {
      setMessage("Completa el nombre, las preguntas y todas sus opciones.")
      return
    }

    const category: QuizCategory = {
      id: editingId || `custom-${Date.now()}`,
      name: cleanName,
      questions: questions.map((question) => ({
        ...question,
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        points: Math.max(1, question.points || 1),
      })),
    }
    saveCustomQuiz(category)
    refreshCategories()
    setMessage("Test guardado. Ya está disponible en todos los modos de juego.")
    setName("")
    setQuestions([emptyQuestion()])
    setEditingId(null)
  }

  const importQuiz = () => {
    try {
      const trimmed = importText.trim()
      const parsedQuestions = fileName.toLowerCase().endsWith(".txt")
        ? parseTxtQuestions(trimmed)
        : parseJsonQuestions(trimmed)
      if (!parsedQuestions.length) throw new Error("empty")
      const category: QuizCategory = {
        id: `imported-${Date.now()}`,
        name: name.trim() || fileName.replace(/\.(json|txt)$/i, "") || "Test importado",
        questions: parsedQuestions,
      }
      saveCustomQuiz(category)
      refreshCategories()
      setMessage(`Test importado con ${parsedQuestions.length} preguntas.`)
      setName("")
      setImportText("")
      setFileName("")
    } catch {
      setMessage("No se pudo importar. Usa la plantilla JSON o el formato TXT indicado.")
    }
  }

  const editQuiz = (category: QuizCategory) => {
    const isCustom = category.id.startsWith("custom-") || category.id.startsWith("imported-")
    const id = isCustom ? category.id : `custom-${Date.now()}`
    setEditingId(id)
    setName(category.name)
    setQuestions(category.questions.map((question) => ({ ...question, options: [...question.options] })))
    if (!isCustom) {
      saveCustomQuiz({ ...category, id })
      refreshCategories()
      setMessage("Se ha creado una copia editable del test incluido.")
    }
    setMode("create")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const removeQuiz = (category: QuizCategory) => {
    const isCustom = category.id.startsWith("custom-") || category.id.startsWith("imported-")
    if (!isCustom) {
      setMessage("Los tests incluidos no se pueden eliminar. Puedes crear una copia editable.")
      return
    }
    if (!window.confirm(`¿Eliminar el test «${category.name}»?`)) return
    deleteCustomQuiz(category.id)
    refreshCategories()
    setMessage("Test eliminado.")
  }

  const readFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImportText(String(reader.result || ""))
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plantilla-test.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadTxtTemplate = () => {
    const blob = new Blob([txtTemplate], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plantilla-test.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadQuiz = (category: QuizCategory) => {
    const blob = new Blob([JSON.stringify(category, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${category.name.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-") || "test"}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(aiPrompt(importText))}`
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt(importText))}`

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
      <Button variant="outline" onClick={() => router.push("/play")} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" /> Volver a jugar
      </Button>
      <div className="mb-8 rounded-3xl border border-black/10 bg-card/80 p-6 shadow-sm dark:border-white/10 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-[#ffec99] p-3 text-2xl">🧩</div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Personaliza tus tests</h1>
            <p className="mt-2 text-muted-foreground">Crea desde cero o importa tus preguntas. Todo queda guardado en este navegador.</p>
          </div>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden border-black/10 shadow-sm dark:border-white/10">
        <CardHeader><CardTitle>Tests existentes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 && <p className="text-sm text-muted-foreground">Cargando tests...</p>}
          {categories.map((category) => {
            const isCustom = category.id.startsWith("custom-") || category.id.startsWith("imported-")
            return (
              <div key={category.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.questions.length} preguntas · {isCustom ? "Guardado en este navegador" : "Incluido"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadQuiz(category)} title="Descargar JSON">
                    <ArrowDownToLine className="mr-1 h-4 w-4" /> JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => editQuiz(category)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => removeQuiz(category)} disabled={!isCustom}>
                    <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="mb-6 flex gap-2 rounded-2xl border border-black/10 bg-card/70 p-2 dark:border-white/10">
        <Button variant={mode === "create" ? "default" : "outline"} onClick={() => setMode("create")}>Crear test</Button>
        <Button variant={mode === "import" ? "default" : "outline"} onClick={() => setMode("import")}>Importar test</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{mode === "create" ? (editingId ? "Editar test" : "Nuevo test") : "Importar desde archivo"}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-name">Nombre del test {mode === "import" && "(opcional)"}</Label>
            <Input id="test-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej.: Historia de España" />
          </div>

          {mode === "create" ? (
            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label>Pregunta {questionIndex + 1}</Label>
                    {questions.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, index) => index !== questionIndex))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea value={question.question} onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })} placeholder="Escribe la pregunta" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <Input key={optionIndex} value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} placeholder={`Opción ${String.fromCharCode(65 + optionIndex)}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Label htmlFor={`answer-${questionIndex}`}>Respuesta correcta</Label>
                    <select id={`answer-${questionIndex}`} value={question.answer} onChange={(event) => updateQuestion(questionIndex, { answer: Number(event.target.value) })} className="rounded border bg-background px-2 py-1">
                      {question.options.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>{String.fromCharCode(65 + optionIndex)}</option>)}
                    </select>
                    <Label htmlFor={`points-${questionIndex}`}>Puntos</Label>
                    <Input id={`points-${questionIndex}`} type="number" min="1" className="w-20" value={question.points || 1} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.target.value) })} />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setQuestions([...questions, emptyQuestion()])} className="gap-2"><Plus className="h-4 w-4" /> Añadir pregunta</Button>
              <Button onClick={createQuiz} className="ml-2">{editingId ? "Guardar cambios" : "Guardar test"}</Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Input type="file" accept=".json,.txt,application/json,text/plain" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} />
                <p className="mt-2 text-sm text-muted-foreground">{fileName || "Selecciona un archivo JSON o TXT"}</p>
              </div>
              <Textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="O pega aquí el contenido de tu test" className="min-h-48 font-mono text-sm" />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={importQuiz} className="gap-2"><Upload className="h-4 w-4" /> Importar test</Button>
                <Button variant="outline" onClick={downloadTemplate} className="gap-2"><Download className="h-4 w-4" /> Descargar plantilla JSON</Button>
                <Button variant="outline" onClick={downloadTxtTemplate} className="gap-2">
                  <Download className="h-4 w-4" /> Descargar plantilla TXT
                </Button>
              </div>
              <div className="rounded-lg border border-purple-500/30 bg-purple-50 p-4 dark:bg-purple-950/20">
                <h3 className="font-semibold">¿Tienes un test con un formato distinto?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No te preocupes: pídele a la IA que lo transforme al formato compatible con make-it-quiz.
                  Si has pegado el contenido arriba, se incluirá automáticamente en la consulta.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="gap-2">
                    <a href={chatGptUrl} target="_blank" rel="noopener noreferrer">
                      Transformar con ChatGPT <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <a href={claudeUrl} target="_blank" rel="noopener noreferrer">
                      Transformar con Claude <Sparkles className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
          {message && <p className="rounded-md bg-muted p-3 text-sm">{message}</p>}
        </CardContent>
      </Card>
    </main>
  )
}
