// The consumer's Tailwind theme (colours copied read-only from bananaworld-dc/tailwind.config.ts) so the
// proof looks like an app. Content globs point at THIS repo's src and the proof page only.
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
        accent: { DEFAULT: v("accent"), subtle: v("accent-subtle") },
        warning: { DEFAULT: v("warning"), subtle: v("warning-subtle"), fg: v("warning-fg") },
      },
      boxShadow: { focus: "0 0 0 3px var(--color-accent)" },
    },
  },
};
