// Same token mapping a consumer (DC) uses; the content globs scan the kit's src like a consumer must.
const v = (n) => `var(--color-${n})`;
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "../../../../src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "surface-muted": v("surface-muted"),
        border: v("border"),
        fg: v("fg"),
        "fg-muted": v("fg-muted"),
        "fg-subtle": v("fg-subtle"),
        "fg-on-accent": v("fg-on-accent"),
        accent: { DEFAULT: v("accent"), hover: v("accent-hover"), subtle: v("accent-subtle") },
      },
      transitionDuration: { fast: "120ms" },
    },
  },
};
