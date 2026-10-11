import "./globals.css";
import type { ReactNode } from "react";
import { Shell } from "./shell";

// No loading.tsx anywhere in this app: that is the fault CR-DESIGN-SYSTEM-018 replaces.
// ?surface=tablet is not read here; the driver sets data-surface on <body> from a cookie-free query
// via the Shell's client code so the same build serves both widths.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body data-surface="browser">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
