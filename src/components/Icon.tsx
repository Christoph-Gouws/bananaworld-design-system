"use client";

import { forwardRef, type ComponentType, type SVGProps } from "react";
import { cn } from "../lib";

/**
 * Icon — UX-DS-008. lucide-react wrapper with surface-aware sizing
 * (20px browser / 28px tablet).
 *
 * Usage:
 *   import { Check } from "lucide-react";
 *   <Icon as={Check} />
 *   <Icon as={Check} size="lg" />
 *
 * Application code imports specific icons from lucide-react and passes them
 * through this wrapper so future icon-library swaps touch one component file.
 */
export type IconSize = "sm" | "md" | "lg";

export interface IconProps extends SVGProps<SVGSVGElement> {
  as: ComponentType<SVGProps<SVGSVGElement>>;
  size?: IconSize;
  label?: string; // when decorative, omit; when meaningful, supply for screen readers
}

function sizeClasses(size: IconSize): string {
  switch (size) {
    case "sm":
      return "h-4 w-4 [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5";
    case "lg":
      return "h-6 w-6 [[data-surface=tablet]_&]:h-9 [[data-surface=tablet]_&]:w-9";
    case "md":
    default:
      return "h-5 w-5 [[data-surface=tablet]_&]:h-7 [[data-surface=tablet]_&]:w-7";
  }
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { as: Component, size = "md", label, className, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cn(sizeClasses(size), className)}
      strokeWidth={1.75}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
});
