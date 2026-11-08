// The consumer's Tailwind theme (colours read-only from the kit tokens) so the proof looks like an app.
// Content globs point at THIS repo's src and the proof page only.
const path = require("node:path");

const root = path.resolve(__dirname, "../../../..");
const v = (n) => `var(--color-${n})`;

module.exports = {
  content: [
    path.join(root, "src/**/*.{ts,tsx}").replace(/\\/g, "/"),
    path.join(__dirname, "main.tsx").replace(/\\/g, "/"),
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "surface-muted": v("surface-muted"),
        "surface-sunken": v("surface-sunken"),
        border: v("border"),
        "border-strong": v("border-strong"),
        fg: v("fg"),
        "fg-muted": v("fg-muted"),
        "fg-subtle": v("fg-subtle"),
        "fg-on-accent": v("fg-on-accent"),
        "accent-hover": v("accent-hover"),
        accent: { DEFAULT: v("accent"), subtle: v("accent-subtle") },
        danger: { DEFAULT: v("danger"), subtle: v("danger-subtle"), fg: v("danger-fg") },
      },
      boxShadow: { focus: "0 0 0 3px var(--color-accent)", xs: "0 1px 2px rgb(0 0 0 / 0.05)" },
    },
  },
};
