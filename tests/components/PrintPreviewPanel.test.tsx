import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";

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
  type PrintPreviewPanelProps,
} from "../../src";

// CR-DESIGN-SYSTEM-030 — the print panel body for a slide-out.

const WORDS = {
  print: "Imprimir",
  download: "Descarregar",
  noViewer: "Este dispositivo não mostra PDF.",
  loading: "A carregar…",
  failed: "Não foi possível.",
};
const pdf = (name: string) => new Blob([name], { type: "application/pdf" });

let created: string[];
let revoked: string[];
let openSpy: ReturnType<typeof vi.fn>;
let saved: { download: string; target: string; href: string }[];
let printCalls: number;

function setViewer(value: boolean | undefined) {
  Object.defineProperty(navigator, "pdfViewerEnabled", { value, configurable: true });
}

beforeEach(() => {
  created = [];
  revoked = [];
  saved = [];
  printCalls = 0;
  let n = 0;
  URL.createObjectURL = () => {
    const url = `blob:test/${++n}`;
    created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url: string) => void revoked.push(url);
  openSpy = vi.fn();
  vi.stubGlobal("open", openSpy);
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    saved.push({
      download: this.download,
      target: this.getAttribute("target") ?? "",
      href: this.getAttribute("href") ?? "",
    });
  });
  // happy-dom frames do not load, so the test fires `load` itself; contentWindow.print is counted.
  Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
    configurable: true,
    get: () => ({ print: () => void printCalls++ }),
  });
  setViewer(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  setViewer(undefined);
});

function setup(over: Partial<PrintPreviewPanelProps> = {}) {
  const props: PrintPreviewPanelProps = {
    load: vi.fn(async () => pdf("preview")),
    print: vi.fn(async () => pdf("final-print")),
    download: vi.fn(async () => pdf("final-download")),
    fileName: "delivery-note-0042.pdf",
    words: WORDS,
    ...over,
  };
  const view = render(<PrintPreviewPanel {...props} />);
  return { props, view };
}
const frame = () => document.querySelector("iframe");
const printBtn = () => screen.getByRole("button", { name: /Imprimir/ });
const downloadBtn = () => screen.getByRole("button", { name: /Descarregar/ });
const ready = () => waitFor(() => expect(frame()).not.toBeNull());
const flush = () => act(async () => void (await Promise.resolve()));

describe("preview", () => {
  it("shows the loading word first, then the preview titled by fileName; load runs once", async () => {
    const { props, view } = setup();
    expect(screen.getByRole("status").textContent).toBe(WORDS.loading);
    await ready();
    expect(frame()?.getAttribute("title")).toBe("delivery-note-0042.pdf");
    expect(frame()?.getAttribute("src")).toBe("blob:test/1");
    view.rerender(
      <PrintPreviewPanel {...props} load={vi.fn(async () => pdf("x"))} print={async () => null} />,
    );
    await flush();
    expect(props.load).toHaveBeenCalledTimes(1);
  });

  it("the preview's own load never prints", async () => {
    setup();
    await ready();
    fireEvent.load(frame()!);
    expect(printCalls).toBe(0);
  });

  it("load rejecting shows the failed word, and Print still works", async () => {
    const { props } = setup({ load: vi.fn(async () => Promise.reject(new Error("x"))) });
    await waitFor(() => expect(screen.getByText(WORDS.failed)).toBeTruthy());
    fireEvent.click(printBtn());
    await ready();
    expect(props.print).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(WORDS.failed)).toBeNull();
  });
});

describe("print with a viewer", () => {
  it("calls print() once, remounts the frame on the new file and prints on its load", async () => {
    const { props } = setup();
    await ready();
    const first = frame();
    fireEvent.click(printBtn());
    await waitFor(() => expect(frame()?.getAttribute("src")).toBe("blob:test/2"));
    expect(props.print).toHaveBeenCalledTimes(1);
    expect(props.download).not.toHaveBeenCalled();
    expect(frame()).not.toBe(first); // keyed: no history entry from a changed src
    expect(printCalls).toBe(0);
    fireEvent.load(frame()!);
    expect(printCalls).toBe(1);
    fireEvent.load(frame()!);
    expect(printCalls).toBe(1);
    await waitFor(() => expect(revoked).toContain("blob:test/1")); // revoked by the effect cleanup
  });

  it("print() returning null opens nothing, saves nothing and says nothing", async () => {
    const { props } = setup({ print: vi.fn(async () => null) });
    await ready();
    const first = frame();
    fireEvent.click(printBtn());
    await waitFor(() => expect(props.print).toHaveBeenCalled());
    await flush();
    expect(frame()).toBe(first);
    expect(printCalls).toBe(0);
    expect(saved).toHaveLength(0);
    expect(screen.queryByRole("alert")).toBeNull();
    expect((printBtn() as HTMLButtonElement).disabled).toBe(false);
  });

  it("a print() rejection or a throwing contentWindow.print() shows the failed word, cleared by the next press", async () => {
    const print = vi.fn<() => Promise<Blob | null>>().mockRejectedValueOnce(new Error("x"));
    print.mockResolvedValue(pdf("final"));
    setup({ print });
    await ready();
    fireEvent.click(printBtn());
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(WORDS.failed));
    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
      configurable: true,
      get: () => ({
        print: () => {
          throw new Error("no");
        },
      }),
    });
    fireEvent.click(printBtn());
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    await waitFor(() => expect(frame()?.getAttribute("src")).toBe("blob:test/2"));
    fireEvent.load(frame()!);
    expect(screen.getByRole("alert").textContent).toBe(WORDS.failed);
  });

  it("a slow preview arriving after Print never overwrites the final file", async () => {
    let release!: (b: Blob) => void;
    const load = vi.fn(() => new Promise<Blob>((r) => (release = r)));
    setup({ load });
    await flush();
    fireEvent.click(printBtn());
    await waitFor(() => expect(frame()?.getAttribute("src")).toBe("blob:test/1"));
    await act(async () => release(pdf("late")));
    expect(frame()?.getAttribute("src")).toBe("blob:test/1");
    expect(created).toHaveLength(1);
  });
});

describe("download", () => {
  it("saves as fileName through a link with no target, leaving the preview alone", async () => {
    const { props } = setup();
    await ready();
    const first = frame();
    fireEvent.click(downloadBtn());
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(props.download).toHaveBeenCalledTimes(1);
    expect(saved[0]).toMatchObject({
      download: "delivery-note-0042.pdf",
      target: "",
      href: "blob:test/2",
    });
    expect(frame()).toBe(first);
    expect(printCalls).toBe(0);
  });

  it("null saves nothing", async () => {
    const { props } = setup({ download: vi.fn(async () => null) });
    await ready();
    fireEvent.click(downloadBtn());
    await waitFor(() => expect(props.download).toHaveBeenCalled());
    await flush();
    expect(saved).toHaveLength(0);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("busy and double taps", () => {
  it("two presses in the same tick make one call; the other button is disabled meanwhile", async () => {
    let release!: (b: Blob) => void;
    const print = vi.fn(() => new Promise<Blob | null>((r) => (release = r)));
    setup({ print });
    await ready();
    act(() => {
      fireEvent.click(printBtn());
      fireEvent.click(printBtn());
    });
    expect(print).toHaveBeenCalledTimes(1);
    expect((downloadBtn() as HTMLButtonElement).disabled).toBe(true);
    expect((printBtn() as HTMLButtonElement).disabled).toBe(true);
    await act(async () => release(pdf("f")));
    expect((downloadBtn() as HTMLButtonElement).disabled).toBe(false);
  });

  it("both buttons are disabled until the device has been read", () => {
    const html = renderToString(<PrintPreviewPanel {...baseProps()} />);
    expect(html).toContain(WORDS.loading);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});

describe("no PDF viewer", () => {
  it("shows noViewer, never loads or frames, and Print saves via print() — never download()", async () => {
    setViewer(false);
    const { props } = setup();
    await flush();
    expect(screen.getByText(WORDS.noViewer)).toBeTruthy();
    expect(props.load).not.toHaveBeenCalled();
    expect(frame()).toBeNull();
    fireEvent.click(printBtn());
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(props.print).toHaveBeenCalledTimes(1);
    expect(props.download).not.toHaveBeenCalled();
    expect(saved[0]?.download).toBe("delivery-note-0042.pdf");
    expect(frame()).toBeNull();
  });

  it("undefined (older browsers) counts as having a viewer", async () => {
    setViewer(undefined);
    const { props } = setup();
    await ready();
    expect(props.load).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(WORDS.noViewer)).toBeNull();
  });
});

describe("unmount and windows", () => {
  it("unmounting mid-call neither prints nor saves, and every file is revoked", async () => {
    let release!: (b: Blob) => void;
    const print = vi.fn(() => new Promise<Blob | null>((r) => (release = r)));
    const { view } = setup({ print });
    await ready();
    fireEvent.click(printBtn());
    view.unmount();
    await act(async () => release(pdf("f")));
    expect(printCalls).toBe(0);
    expect(saved).toHaveLength(0);
    expect(created).toEqual(["blob:test/1"]);
    expect(revoked).toEqual(["blob:test/1"]);
  });

  it("a saved file's URL is revoked when the panel goes", async () => {
    const { view } = setup();
    await ready();
    fireEvent.click(downloadBtn());
    await waitFor(() => expect(saved).toHaveLength(1));
    view.unmount();
    expect(revoked).toEqual(expect.arrayContaining(["blob:test/1", "blob:test/2"]));
  });

  it("window.open is never called, in any path", async () => {
    setup();
    await ready();
    fireEvent.click(downloadBtn());
    await waitFor(() => expect(saved).toHaveLength(1));
    fireEvent.click(printBtn());
    await waitFor(() => expect(frame()?.getAttribute("src")).toBe("blob:test/3"));
    fireEvent.load(frame()!);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("the source opens no window, names no _blank, hard-codes no colour or English word", () => {
    const src = readFileSync("src/components/PrintPreviewPanel.tsx", "utf8");
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/window\.open|_blank|target\s*=|\.target\b/);
    expect(code).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(code).not.toMatch(/["'`>]\s*(Print|Download|Loading|Failed)\b/);
  });
});

function baseProps(): PrintPreviewPanelProps {
  return {
    load: async () => pdf("p"),
    print: async () => pdf("p"),
    download: async () => pdf("p"),
    fileName: "n.pdf",
    words: WORDS,
  };
}

describe("server rendering", () => {
  it("renders with no navigator access during render", () => {
    vi.stubGlobal("navigator", undefined);
    expect(() => renderToString(<PrintPreviewPanel {...baseProps()} />)).not.toThrow();
  });
});

async function violations(root: Element): Promise<string[]> {
  return (await axe.run(root as HTMLElement, { iframes: false })).violations.map((v) => v.id);
}

describe("accessibility inside a real host", () => {
  it("has no axe violations loading, ready and failed, inside a Sheet", async () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Note</SheetTitle>
            <SheetDescription>Preview</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <PrintPreviewPanel {...baseProps()} load={() => new Promise<Blob>(() => {})} />
          </SheetBody>
        </SheetContent>
      </Sheet>,
    );
    expect(await violations(document.querySelector("[role=dialog]")!)).toEqual([]);
  });

  it("has no axe violations ready, inside a SlideOver", async () => {
    render(
      <SlideOver open>
        <SlideOverContent>
          <SlideOverHeader>
            <SlideOverTitle>Note</SlideOverTitle>
            <SlideOverDescription>Preview</SlideOverDescription>
          </SlideOverHeader>
          <SlideOverBody>
            <PrintPreviewPanel {...baseProps()} />
          </SlideOverBody>
        </SlideOverContent>
      </SlideOver>,
    );
    await ready();
    expect(await violations(document.querySelector("[role=dialog]")!)).toEqual([]);
  });

  it("has no axe violations with no viewer and after a failure", async () => {
    setViewer(false);
    const { view } = setup({ print: async () => Promise.reject(new Error("x")) });
    await flush();
    fireEvent.click(printBtn());
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(await violations(view.container)).toEqual([]);
  });
});
