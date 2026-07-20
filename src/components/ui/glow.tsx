"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlowMode = "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static";

const BLUR_PRESETS = {
  soft: "blur-md",
  medium: "blur-lg",
  strong: "blur-xl",
} as const;

type BlurPreset = keyof typeof BLUR_PRESETS;

function getBlurClass(blur: number | BlurPreset | undefined) {
  if (blur === undefined) return BLUR_PRESETS.medium;
  if (typeof blur === "number") return `blur-[${blur}px]`;
  return BLUR_PRESETS[blur] ?? BLUR_PRESETS.medium;
}

type GlowEffectLayerProps = {
  className?: string;
  colors?: string[];
  mode?: GlowMode;
  blur?: number | BlurPreset;
  duration?: number;
  scale?: number;
};

function GlowEffectLayer({
  className,
  colors = ["#1F6E4A", "#3DBD82"],
  mode = "rotate",
  blur = "medium",
  duration = 3.5,
  scale = 1,
}: GlowEffectLayerProps) {
  const blurClass = getBlurClass(blur);

  const animations: Record<GlowMode, TargetAndTransition> = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")}, ${colors[0]})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")}, ${colors[0]})`,
      ],
      transition: {
        duration,
        repeat: Infinity,
        ease: "linear",
      },
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    breathe: {
      background: [
        `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, transparent 100%)`,
        `radial-gradient(circle at 50% 50%, ${colors[1] ?? colors[0]} 0%, transparent 100%)`,
        `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, transparent 100%)`,
      ],
      scale: [1, 1.05, 1],
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    colorShift: {
      background: colors.map(
        (color) => `linear-gradient(90deg, ${color}, ${color})`
      ),
      transition: {
        duration,
        repeat: Infinity,
        ease: "linear",
      },
    },
    flowHorizontal: {
      backgroundPosition: ["0% 50%", "100% 50%"],
      transition: {
        duration,
        repeat: Infinity,
        ease: "linear",
      },
    },
    static: {
      background: `linear-gradient(90deg, ${colors.join(", ")})`,
    },
  };

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
        blurClass,
        className
      )}
      style={{ transform: `scale(${scale})` }}
      animate={animations[mode]}
    />
  );
}

type GlowButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    colors?: string[];
    mode?: GlowMode;
    blur?: number | BlurPreset;
    duration?: number;
    glowClassName?: string;
  };

export function GlowButton({
  className,
  glowClassName,
  colors = ["#1F6E4A", "#3DBD82"],
  mode = "rotate",
  blur = "medium",
  duration = 3.5,
  variant,
  size,
  asChild = false,
  disabled,
  children,
  ...props
}: GlowButtonProps) {
  return (
    <motion.div
      className="relative inline-flex"
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <GlowEffectLayer
        className={glowClassName}
        colors={colors}
        mode={mode}
        blur={blur}
        duration={duration}
      />
      <Button
        asChild={asChild}
        variant={variant}
        size={size}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

export default GlowButton;
