// The consumer's Tailwind theme, so the proof screenshots look like the app rather than unstyled markup.
// This package ships no compiled CSS — every consuming app compiles these classes with its own config.
// COPIED (read-only) from bananaworld-dc/tailwind.config.ts:14-66 (colours, type step, radii, shadows,
// durations, the fade-in keyframe). Content globs point at THIS repo's src and the proof page only.
const path = require("node:path");

const root = path.resolve(__dirname, "../../../..");

module.exports = {
  content: [
    path.join(root, "src/**/*.{ts,tsx}").replace(/\\/g, "/"),
    path.join(__dirname, "main.tsx").replace(/\\/g, "/"),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: { "2xs": "0.6875rem" },
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        "surface-sunken": "var(--color-surface-sunken)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-subtle": "var(--color-fg-subtle)",
        accent: { DEFAULT: "var(--color-accent)", subtle: "var(--color-accent-subtle)" },
        info: {
          DEFAULT: "var(--color-info)",
          subtle: "var(--color-info-subtle)",
          fg: "var(--color-info-fg)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        focus: "var(--shadow-focus)",
      },
      transitionDuration: { fast: "120ms" },
      keyframes: { "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } } },
      animation: { "fade-in": "fade-in 180ms cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
};
