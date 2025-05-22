"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <Navbar />
      <main>{children}</main>
    </ThemeProvider>
  )
}
