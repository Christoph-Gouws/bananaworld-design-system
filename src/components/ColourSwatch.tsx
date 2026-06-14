// ColourSwatch — a small filled square showing an arbitrary hex colour (EPIC-004-M005).
//
// Per TECH-COMP-003 this is pure UI plumbing: it renders whatever `hex` it is given and carries no
// business meaning. The colour values it shows come from the banana_colour_stage master (read at
// request time), never from a constant here — so it does not breach the no-hard-coded-colour-stages
// rule. An inline backgroundColor is unavoidable: the hex is dynamic, so Tailwind cannot express it.

import { cn } from "../lib";

export interface ColourSwatchProps {
  // A 6-digit `#RRGGBB` colour string (as stored on banana_colour_stage.colour_hex).
  readonly hex: string;
  // Optional second colour (banana_colour_stage.accent_hex). When present the swatch blends
  // hex → accentHex (a diagonal gradient) so a two-tone banana reads better than a solid block.
  readonly accentHex?: string | null;
  readonly className?: string;
}

export function ColourSwatch({ hex, accentHex, className }: ColourSwatchProps) {
  const background =
    accentHex != null && accentHex !== ""
      ? `linear-gradient(135deg, ${hex} 0%, ${accentHex} 100%)`
      : hex;
  return (
    <span
      aria-hidden
      className={cn("inline-block h-7 w-7 shrink-0 rounded-sm border border-border", className)}
      style={{ background }}
    />
  );
}
