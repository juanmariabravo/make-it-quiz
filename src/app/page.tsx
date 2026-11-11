import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Github, Sparkles, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  { icon: "📝", title: "A tu medida", text: "Crea o importa tests en JSON y TXT." },
  { icon: "🎯", title: "Aprende jugando", text: "Elige el modo que mejor encaje contigo." },
  { icon: "⚡", title: "Sin complicaciones", text: "Tus tests están listos en segundos." },
]

const modes = [
  {
    name: "Estudio",
    description: "Repasa a tu ritmo y recibe feedback inmediato.",
    color: "bg-[#ff8787]",
    icon: "📚",
  },
  {
    name: "Examen",
    description: "Pon a prueba tus conocimientos contrarreloj.",
    color: "bg-[#b2f2bb]",
    icon: "⏱️",
  },
  {
    name: "CLI",
    description: "Juega desde la terminal con una experiencia directa.",
    color: "bg-[#ffec99]",
    icon: "⌨️",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <main>
        <section className="relative">
          <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#ff8787]/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-[#a5d8ff]/40 blur-3xl" />
          <div className="container relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
            <div className="text-center md:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-white/5">
                <Sparkles className="h-4 w-4 text-[#ff8787]" />
                Aprende. Compite. Diviértete.
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                Convierte tus preguntas en una{" "}
                <span className="bg-gradient-to-r from-[#ff8787] via-[#845ef7] to-[#4dabf7] bg-clip-text text-transparent">
                  experiencia
                </span>
                .
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground md:mx-0">
                Crea tests personalizados y juega como quieras: estudiando, compitiendo con amigos o superándote
                contrarreloj.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                <Button asChild size="lg" className="h-14 rounded-full bg-black px-7 text-base text-white shadow-xl shadow-black/10 hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                  <Link href="/play">
                    Empezar a jugar <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-black/15 px-7 text-base dark:border-white/15">
                  <Link href="/tests">Crear mi test</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground md:justify-start">
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Tests personalizados</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Multijugador online</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rotate-3 rounded-[2.5rem] bg-gradient-to-br from-[#ff8787] via-[#ffec99] to-[#a5d8ff] opacity-70 blur-sm" />
              <div className="relative rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-2xl shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-card/90">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#ffec99] px-3 py-1 text-xs font-bold text-black">NUEVO RETO</span>
                  <Zap className="h-5 w-5 text-[#ff8787]" />
                </div>
                <Image
                  src="/favicon/web-app-manifest-512x512.png"
                  alt="Logo de make-it-quiz"
                  width={280}
                  height={280}
                  priority
                  className="mx-auto my-8 h-56 w-56 rounded-[2rem] object-contain"
                />
                <div className="rounded-2xl bg-black p-5 text-white dark:bg-white dark:text-black">
                  <div className="flex items-center justify-between text-sm opacity-70">
                    <span>Tu próxima partida</span>
                    <span>01 / 10</span>
                  </div>
                  <p className="mt-3 text-xl font-bold">¿Listo para demostrar lo que sabes?</p>
                  <div className="mt-4 h-2 rounded-full bg-white/20 dark:bg-black/15">
                    <div className="h-2 w-1/3 rounded-full bg-[#ff8787]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-8 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-black/10 bg-card/60 p-6 transition-transform hover:-translate-y-1 dark:border-white/10">
                <span className="text-3xl">{benefit.icon}</span>
                <h2 className="mt-4 text-lg font-bold">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#845ef7]">Una forma para cada momento</p>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Elige cómo quieres jugar</h2>
            </div>
            <Button asChild variant="ghost" className="w-fit rounded-full">
              <Link href="/play">Ver todos los modos <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modes.map((mode) => (
              <Link key={mode.name} href="/play" className="group rounded-2xl border border-black/10 bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${mode.color}`}>{mode.icon}</div>
                <h3 className="mt-5 font-bold">{mode.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode.description}</p>
                <ArrowRight className="mt-5 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-black px-6 py-12 text-center text-white dark:bg-white dark:text-black sm:px-12">
            <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-[#ff8787] opacity-80 blur-2xl" />
            <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-[#a5d8ff] opacity-80 blur-2xl" />
            <div className="relative">
              <Users className="mx-auto mb-4 h-8 w-8" />
              <h2 className="text-3xl font-black sm:text-4xl">¿Tienes un grupo preparado?</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/70 dark:text-black/60">Crea un test personalizado y empieza a jugar con tus propias preguntas.</p>
              <Button asChild size="lg" className="mt-7 rounded-full bg-white px-7 text-black hover:bg-white/85 dark:bg-black dark:text-white dark:hover:bg-black/80">
                <Link href="/tests">Personalizar mi test</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} make-it-quiz</p>
          <div className="flex items-center gap-5">
            <Link href="/tests" className="hover:text-foreground">Personalizar tests</Link>
            <Link href="https://github.com/juanmariabravo/make-it-quiz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
              <Github className="h-4 w-4" /> GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
