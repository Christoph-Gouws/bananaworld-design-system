// CR-DESIGN-SYSTEM-030 — browser proof page. The REAL kit PrintPreviewPanel from this repo's `src/`, hosted
// in a real Sheet or SlideOver. Query: host=sheet|slideover, kind=pdf|html (blob type), refuse=1 (print() → null),
// surface=browser|tablet, theme=teal|yellow. Callbacks are stubbed at the edge; the page and component are real.
import { useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";

import {
  PrintPreviewPanel,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SlideOver,
  SlideOverBody,
  SlideOverContent,
  SlideOverDescription,
  SlideOverHeader,
  SlideOverTitle,
} from "../../../../src";
import "./.out/proof.css";

const q = new URLSearchParams(location.search);
const kind = q.get("kind") ?? "pdf";
document.documentElement.dataset.surface = q.get("surface") ?? "browser";
if (q.get("theme") === "teal") document.documentElement.dataset.theme = "packhouse";

const PDF = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
const blob = (label: string): Blob =>
  kind === "html"
    ? new Blob([`<!doctype html><body style="font:20px sans-serif;padding:24px">${label}</body>`], { type: "text/html" })
    : new Blob([PDF], { type: "application/pdf" });

const w = window as unknown as { __calls: string[] };
w.__calls = [];
const call = (name: string) => w.__calls.push(name);

const panel = (
  <PrintPreviewPanel
    load={async () => (call("load"), blob("Pré-visualização da nota"))}
    print={async () => (call("print"), q.get("refuse") === "1" ? null : blob("Nota final impressa"))}
    download={async () => (call("download"), blob("Nota final descarregada"))}
    fileName="nota-de-entrega-0042.pdf"
    words={{
      print: "Imprimir",
      download: "Descarregar",
      noViewer: "Este dispositivo não mostra PDF. Use Imprimir para guardar o ficheiro.",
      loading: "A carregar a nota…",
      failed: "Não foi possível mostrar a nota.",
    }}
  />
);

function App(): ReactElement {
  const [open, setOpen] = useState(true);
  return q.get("host") === "slideover" ? (
    <SlideOver open={open} onOpenChange={setOpen}>
      <SlideOverContent>
        <SlideOverHeader>
          <SlideOverTitle>Nota de entrega 0042</SlideOverTitle>
          <SlideOverDescription>Pré-visualização</SlideOverDescription>
        </SlideOverHeader>
        <SlideOverBody>{panel}</SlideOverBody>
      </SlideOverContent>
    </SlideOver>
  ) : (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nota de entrega 0042</SheetTitle>
          <SheetDescription>Pré-visualização</SheetDescription>
        </SheetHeader>
        <SheetBody>{panel}</SheetBody>
      </SheetContent>
    </Sheet>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
