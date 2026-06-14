"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Surface = "browser" | "tablet";

const SurfaceContext = createContext<Surface>("browser");

export function SurfaceProvider({ surface, children }: { surface: Surface; children: ReactNode }) {
  return <SurfaceContext.Provider value={surface}>{children}</SurfaceContext.Provider>;
}

export function useSurface(): Surface {
  return useContext(SurfaceContext);
}
