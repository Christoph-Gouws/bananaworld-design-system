// The consumer's Tailwind theme (copied read-only from bananaworld-dc/tailwind.config.ts) so the proof
// looks like an app. Content globs point at THIS repo's src and the proof page only.
const path = require("node:path");

const root = path.resolve(__dirname, "../../../..");
const v = (n) => `var(--color-${n})`;
const family = (n) => ({
  DEFAULT: v(n),
  subtle: v(`${n}-subtle`),
  fg: v(`${n}-fg`),
});

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
        ring: v("ring"),
        fg: v("fg"),
        "fg-muted": v("fg-muted"),
        "fg-subtle": v("fg-subtle"),
        "fg-on-accent": v("fg-on-accent"),
        accent: { DEFAULT: v("accent"), hover: v("accent-hover"), subtle: v("accent-subtle") },
        success: family("success"),
        warning: family("warning"),
        danger: family("danger"),
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        focus: "var(--shadow-focus)",
      },
      transitionDuration: { fast: "120ms", DEFAULT: "180ms" },
    },
  },
};
