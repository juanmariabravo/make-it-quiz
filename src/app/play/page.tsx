import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Users, Terminal } from "lucide-react"

export default function PlayPage() {
  const gameModes = [
    {
      title: "Modo Estudio",
      description: "Estudia a tu ritmo y comprueba tus respuestas",
      icon: <BookOpen className="h-10 w-10 text-purple-500" />,
      href: "/play/study",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Modo Examen",
      description: "Contrarreloj: responde antes de que acabe el tiempo",
      icon: <Clock className="h-10 w-10 text-orange-500" />,
      href: "/play/exam",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Modo Kahoot",
      description: "Compite con amigos por puntos en tiempo real",
      icon: <Users className="h-10 w-10 text-pink-500" />,
      href: "/play/kahoot",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
    },
    {
      title: "Modo CLI",
      description: "Experiencia en línea de comandos para los más técnicos",
      icon: <Terminal className="h-10 w-10 text-emerald-500" />,
      href: "/play/cli",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Elige un modo de juego</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Selecciona cómo quieres jugar con tus preguntas personalizadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameModes.map((mode) => (
            <Link key={mode.title} href={mode.href} className="block group">
              <Card
                className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-${mode.color.split("-")[1]}-400 ${mode.bgColor} bg-opacity-30`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{mode.title}</CardTitle>
                    {mode.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{mode.description}</CardDescription>
                  <div
                    className={`h-1.5 w-0 group-hover:w-full mt-4 rounded-full bg-gradient-to-r ${mode.color} transition-all duration-500`}
                  ></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
