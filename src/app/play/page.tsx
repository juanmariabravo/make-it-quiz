import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Clock, Sparkles, Terminal } from "lucide-react"

export default function PlayPage() {
  const gameModes = [
    {
      title: "Modo Estudio",
      description: "Estudia a tu ritmo y comprueba tus respuestas",
      icon: <BookOpen className="h-10 w-10 text-purple-500" />,
      href: "/play/study",
      color: "from-[#ff8787] to-[#845ef7]",
      bgColor: "bg-[#ff8787]/15",
    },
    {
      title: "Modo Examen",
      description: "Contrarreloj: responde antes de que acabe el tiempo",
      icon: <Clock className="h-10 w-10 text-orange-500" />,
      href: "/play/exam",
      color: "from-[#ffec99] to-[#ff8787]",
      bgColor: "bg-[#ffec99]/20",
    },
    {
      title: "Modo CLI",
      description: "Experiencia en línea de comandos para los más técnicos",
      icon: <Terminal className="h-10 w-10 text-emerald-500" />,
      href: "/play/cli",
      color: "from-[#b2f2bb] to-[#20c997]",
      bgColor: "bg-[#b2f2bb]/20",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-white/5">
            <Sparkles className="h-4 w-4 text-[#ff8787]" /> Tu siguiente reto empieza aquí
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Elige tu forma de <span className="bg-gradient-to-r from-[#ff8787] via-[#845ef7] to-[#4dabf7] bg-clip-text text-transparent">jugar</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Selecciona una experiencia y convierte tus preguntas personalizadas en una partida memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {gameModes.map((mode) => (
            <Link key={mode.title} href={mode.href} className="block group">
              <Card
                className={`h-full overflow-hidden border border-black/10 bg-card/80 text-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/85 dark:text-white ${mode.bgColor}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{mode.title}</CardTitle>
                    <div className="rounded-2xl bg-background/70 p-3 dark:bg-white/10">{mode.icon}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">{mode.description}</CardDescription>
                  <div
                    className={`mt-6 h-1.5 w-16 rounded-full bg-gradient-to-r ${mode.color} transition-all duration-500 group-hover:w-full`}
                  ></div>
                  <div className="mt-5 flex items-center text-sm font-semibold">Empezar <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl border border-black/10 bg-card/70 p-6 text-center dark:border-white/10 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-bold">¿Aún no tienes un test?</p>
            <p className="text-sm text-muted-foreground">Crea uno o importa tus preguntas en segundos.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tests"
            className="inline-flex min-w-48 items-center justify-center rounded-full bg-black px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black"
          >
            Personalizar tests
          </Link>
          <Link
            href="/"
            className="inline-flex min-w-48 items-center justify-center rounded-full border border-purple-500/40 px-6 py-3 font-medium text-purple-600 transition-colors hover:bg-purple-500/10"
          >
            Volver al inicio
          </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
