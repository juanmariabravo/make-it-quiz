export interface Question {
  question: string
  options: string[]
  answer: number
  points?: number
}

export interface QuizCategory {
  id: string
  name: string
  questions: Question[]
}

export interface GameState {
  currentQuestion: number
  score: number
  answers: number[]
  timeRemaining?: number
  isFinished: boolean
}

export type GameMode = "study" | "exam" | "kahoot" | "cli"
