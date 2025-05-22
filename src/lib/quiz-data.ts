import type { Question, QuizCategory } from "./types"

// Ejemplo de categorías y preguntas para demostración
export const sampleCategories: QuizCategory[] = [
  {
    id: "general-knowledge",
    name: "Conocimiento General",
    questions: [
      {
        question: "¿Cuál es la capital de Francia?",
        options: ["París", "Londres", "Berlín", "Madrid"],
        answer: 0,
        points: 2,
      },
      {
        question: "¿Qué planeta es conocido como el planeta rojo?",
        options: ["Venus", "Marte", "Júpiter", "Saturno"],
        answer: 1,
      },
      {
        question: "¿Quién pintó la Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Miguel Ángel"],
        answer: 2,
        points: 3,
      },
    ],
  },
  {
    id: "programming",
    name: "Programación",
    questions: [
      {
        question: "¿Qué es Python?",
        options: ["Un instrumento musical", "Un lenguaje de programación", "Una serpiente", "Un tipo de comida"],
        answer: 1,
      },
      {
        question: "¿Qué significa HTML?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyper Transfer Markup Language",
          "Home Tool Markup Language",
        ],
        answer: 0,
        points: 2,
      },
      {
        question: "¿Cuál de estos NO es un lenguaje de programación?",
        options: ["Java", "Python", "HTML", "C++"],
        answer: 2,
      },
    ],
  },
]

// Función para cargar datos de preguntas (simulada)
export async function loadQuizCategories(): Promise<QuizCategory[]> {
  // En una implementación real, esto cargaría datos de archivos o una API
  return sampleCategories
}

// Función para parsear preguntas desde formato TXT
export function parseTxtQuestions(txtContent: string): Question[] {
  const questions: Question[] = []
  const questionBlocks = txtContent.split(/\n\s*\n/)

  for (const block of questionBlocks) {
    if (!block.trim()) continue

    const lines = block.split("\n")
    const questionText = lines[0].trim()
    const options: string[] = []
    let answer = -1
    let points = 1

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith("a)") || line.startsWith("b)") || line.startsWith("c)") || line.startsWith("d)")) {
        options.push(line.substring(2).trim())
      } else if (line.startsWith("Solución:")) {
        const solutionLetter = line.substring(9).trim()
        answer = solutionLetter === "a)" ? 0 : solutionLetter === "b)" ? 1 : solutionLetter === "c)" ? 2 : 3
      } else if (line.startsWith("Puntos:")) {
        points = Number.parseInt(line.substring(7).trim()) || 1
      }
    }

    if (questionText && options.length > 0 && answer >= 0) {
      questions.push({
        question: questionText,
        options,
        answer,
        points,
      })
    }
  }

  return questions
}

// Función para parsear preguntas desde formato JSON
export function parseJsonQuestions(jsonContent: string): Question[] {
  try {
    const data = JSON.parse(jsonContent)
    if (Array.isArray(data.questions)) {
      return data.questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        points: q.points || 1,
      }))
    }
    return []
  } catch (error) {
    console.error("Error parsing JSON questions:", error)
    return []
  }
}
