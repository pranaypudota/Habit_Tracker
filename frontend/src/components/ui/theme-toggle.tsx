"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("w-16 h-8 p-1 rounded-full bg-zinc-950 border border-zinc-800", className)} />
    )
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark"
    setTheme(nextTheme)
  }

  return (
    <div
      className={cn(
        "relative flex items-center p-1 cursor-pointer transition-all duration-500 rounded-full border bg-opacity-10 backdrop-blur-md group shrink-0",
        isDark
          ? "bg-zinc-900 border-zinc-800"
          : "bg-gray-100 border-gray-300",
        className
      )}
      style={{ width: '64px', height: '32px' }}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleTheme()
        }
      }}
    >
      {/* Background Icons (Static) */}
      <div className="flex w-full justify-between px-1.5 z-0">
        <Sun className={cn("w-3.5 h-3.5 transition-opacity", isDark ? "text-zinc-500 opacity-100" : "opacity-0")} strokeWidth={2} />
        <Moon className={cn("w-3.5 h-3.5 transition-opacity", !isDark ? "text-gray-400 opacity-100" : "opacity-0")} strokeWidth={2} />
      </div>

      {/* Sliding Indicator Capsule */}
      <div
        className={cn(
          "absolute w-6 h-6 rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex items-center justify-center z-10 shadow-lg",
          isDark
            ? "translate-x-[32px] bg-zinc-800 text-white"
            : "translate-x-0 bg-white text-gray-800"
        )}
        style={{ left: '4px' }}

      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
        ) : (
          <Sun className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
        )}
      </div>
    </div>
  )
}
