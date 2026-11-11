"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Github, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium">
                  Inicio
                </Link>
                <Link href="/play" className="text-lg font-medium">
                  Jugar
                </Link>
                <Link href="/tests" className="text-lg font-medium">
                  Personalizar tests
                </Link>
                <Link
                  href="https://github.com/juanmariabravo/make-it-quiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium"
                >
                  GitHub
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/favicon/favicon-96x96.png"
              alt="make-it-quiz"
              width={42}
              height={42}
              className="rounded-xl"
            />
            <span className="text-lg font-bold tracking-tight">make-it-quiz</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/play" className="text-sm font-medium transition-colors hover:text-primary">
            Jugar
          </Link>
          <Link href="/tests" className="text-sm font-medium transition-colors hover:text-primary">
            Personalizar tests
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon">
            <Link href="https://github.com/juanmariabravo/make-it-quiz" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
