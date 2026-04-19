"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, children, ...props }, ref) => (
  <AnimatePresence>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        asChild
        className={cn(
          "z-[100] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-3 py-2 text-[0.75rem] font-bold text-[var(--color-text-primary)] shadow-xl backdrop-blur-md",
          className
        )}
        {...props}
      >
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 4 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 4 }}
           transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
          <TooltipPrimitive.Arrow className="fill-[var(--color-border)]" />
        </motion.div>
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </AnimatePresence>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

/**
 * Unified Tooltip component for easy usage
 */
export function TooltipSimple({ children, label, side = "top", align = "center" }: { 
    children: React.ReactNode; 
    label: string; 
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
}) {
    return (
        <TooltipProvider delayDuration={400}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
