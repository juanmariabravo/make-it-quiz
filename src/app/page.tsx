import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            make-it-quiz
          </h1>
          <p className="text-2xl text-muted-foreground">Tus preguntas, tu juego</p>

          <div className="max-w-xl mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-lg">
            <p className="text-lg mb-4">
              Herramienta para crear y jugar tests interactivos <span className="font-bold">personalizados</span> con
              múltiples modos de juego.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col items-center p-3 rounded-lg bg-purple-100/10 border border-purple-500/20">
                <span className="text-3xl mb-2">📝</span>
                <h3 className="font-semibold">Personalizable</h3>
                <p className="text-sm text-muted-foreground">Añade tus propias preguntas en TXT/JSON</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-purple-100/10 border border-purple-500/20">
                <span className="text-3xl mb-2">🎮</span>
                <h3 className="font-semibold">Múltiples modos</h3>
                <p className="text-sm text-muted-foreground">Estudio, Examen, Kahoot, CLI</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 h-auto text-lg rounded-full shadow-lg transition-all hover:shadow-xl"
            >
              <Link href="/play">¡Jugar ahora!</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-purple-500/30 hover:bg-purple-500/10 font-semibold px-6 py-6 h-auto text-lg rounded-full"
            >
              <Link href="https://github.com/juanmariabravo/make-it-quiz" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                Ver código
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} make-it-quiz. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Desarrollado por{" "}
            <a
              href="https://github.com/juanmariabravo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Juan María Bravo López
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
