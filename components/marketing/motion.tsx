"use client"

import * as React from "react"
import { motion, type Transition, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1]

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const staggerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

interface FadeUpProps extends React.ComponentProps<typeof motion.div> {
  delay?: number
  duration?: number
  as?: "div" | "section" | "header" | "article" | "li" | "p"
}

export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  className,
  as = "div",
  ...rest
}: FadeUpProps) {
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUpVariants}
      transition={{ duration, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

interface StaggerProps extends React.ComponentProps<typeof motion.div> {
  as?: "div" | "ul" | "ol" | "section"
  amount?: number
}

export function Stagger({
  children,
  className,
  as = "div",
  amount = 0.15,
  ...rest
}: StaggerProps) {
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={staggerVariants}
      {...rest}
    >
      {children}
    </Comp>
  )
}

interface StaggerItemProps extends React.ComponentProps<typeof motion.div> {
  as?: "div" | "li" | "article" | "p"
  duration?: number
}

export function StaggerItem({
  children,
  className,
  as = "div",
  duration = 0.7,
  ...rest
}: StaggerItemProps) {
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      className={className}
      variants={fadeUpVariants}
      transition={{ duration, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

interface MarqueeProps {
  className?: string
  pauseOnHover?: boolean
  speedSeconds?: number
  children: React.ReactNode
}

export function Marquee({
  className,
  pauseOnHover = true,
  speedSeconds = 40,
  children,
}: MarqueeProps) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max gap-12 will-change-transform",
          "animate-[marquee_var(--marquee-duration)_linear_infinite]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ ["--marquee-duration" as string]: `${speedSeconds}s` }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div
          className="flex shrink-0 items-center gap-12"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
