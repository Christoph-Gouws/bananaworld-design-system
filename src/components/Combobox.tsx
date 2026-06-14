"use client";

// Combobox — UX-DS searchable single-select (EPIC-009-M002, REF-008/009/014/015). The ONE reusable
// type-ahead picker: it replaces a plain dropdown when the option list is long enough that scanning it is
// slow. Tapping the field OPENS WITH THE FULL LIST and typing narrows it (owner UI decision 2026-06-07) —
// so the operator can still browse, or search. Pure presentation: the parent owns the option data + the
// selected value (no network, no warehouse_id, no business rules — TECH-COMP-003). Tablet sizing rides
// the shared `data-surface` attribute via Input + the [[data-surface=tablet]] selectors below.
//
// The listbox is PORTALLED to <body> with fixed positioning anchored to the input. That is deliberate:
// these pickers live inside `overflow-x-auto` line tables (PO / Sales Order) and inside the bottom Sheet
// (z-modal 80) — an inline-rendered dropdown would be clipped by the scroll container, and a body portal
// at --z-dropdown (95) layers above the sheet, mirroring how Radix Select already escapes those contexts.
//
// Two usage shapes share this one component:
//   • Persistent select — parent stores `value`; the field shows the chosen option's label (item pickers).
//   • Pick-and-clear   — parent keeps `value={null}` and consumes onChange to add to a list; the field
//                        returns to empty after each pick (the conversion source picker).

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../lib";

import { Input } from "./Input";

export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  // Optional dimmer second line (e.g. a pallet's item · container · room summary).
  readonly sublabel?: string;
  // Extra text the filter matches but does not display (e.g. a batch code).
  readonly keywords?: string;
}

export interface ComboboxProps {
  readonly options: readonly ComboboxOption[];
  // The selected option's value, or null/"" when nothing is chosen.
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  // Text shown in the closed/empty field.
  readonly placeholder?: string;
  // Shown when a query matches no option.
  readonly emptyMessage?: string;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  // Clear the field after a pick instead of showing the chosen label (the pick-and-clear shape).
  readonly clearOnSelect?: boolean;
  readonly id?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
}

interface AnchorRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
}

// Every whitespace-separated part of the query must appear somewhere in the option's searchable text —
// "car 7" matches "Banana Carton 7kg". Case-insensitive.
function matches(option: ComboboxOption, query: string): boolean {
  const haystack =
    `${option.label} ${option.sublabel ?? ""} ${option.keywords ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p !== "")
    .every((part) => haystack.includes(part));
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Search…",
  emptyMessage = "No matches.",
  disabled,
  invalid,
  clearOnSelect,
  id,
  "aria-label": ariaLabel,
  className,
}: ComboboxProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reactId = useId();
  const listId = `${id ?? reactId}-listbox`;

  const selected = useMemo(
    () =>
      value !== null && value !== "" ? (options.find((o) => o.value === value) ?? null) : null,
    [options, value],
  );

  const filtered = useMemo(() => options.filter((o) => matches(o, query)), [options, query]);

  const updateAnchor = useCallback(() => {
    const el = inputRef.current;
    if (el === null) return;
    const r = el.getBoundingClientRect();
    setAnchor({ left: r.left, top: r.bottom + 4, width: r.width });
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // Keep the portalled listbox pinned to the input while it is open (the Sheet body scrolls).
  useEffect(() => {
    if (open === false) return;
    updateAnchor();
    function onReposition(): void {
      updateAnchor();
    }
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, updateAnchor]);

  // Outside-click closes — the listbox is portalled, so check both the input box and the listbox.
  useEffect(() => {
    function onDocPointer(event: MouseEvent): void {
      const target = event.target as Node;
      const inBox = boxRef.current?.contains(target) === true;
      const inList = listRef.current?.contains(target) === true;
      if (inBox === false && inList === false) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  // Keep the keyboard-highlighted option in view.
  useEffect(() => {
    if (open === false) return;
    const list = listRef.current;
    // eslint-disable-next-line security/detect-object-injection -- activeIndex is a bounded array index
    const active = list?.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function openList(): void {
    if (disabled === true) return;
    setOpen(true);
    setQuery("");
  }

  function choose(option: ComboboxOption): void {
    onChange(option.value);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open === false) {
        openList();
        return;
      }
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      // eslint-disable-next-line security/detect-object-injection -- activeIndex is a bounded array index
      const candidate = open ? filtered[activeIndex] : undefined;
      if (candidate !== undefined) {
        event.preventDefault();
        choose(candidate);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  // Closed: the chosen label (or placeholder). Open: the editable query.
  let fieldValue: string;
  if (open) {
    fieldValue = query;
  } else if (clearOnSelect === true) {
    fieldValue = "";
  } else {
    fieldValue = selected?.label ?? "";
  }

  const listbox =
    open && anchor !== null && typeof document !== "undefined"
      ? createPortal(
          <div
            // pointer-events-auto is REQUIRED: this listbox is portalled to <body>, and when the field sits
            // inside a Radix modal (the document Sheet / SlideOver, default `modal`), Radix locks
            // `pointer-events: none` on everything outside the dialog content — so the body portal would be
            // keyboard-selectable (focus stays in the input) but NOT clickable. Re-enabling pointer events
            // here restores mouse/touch selection. (EPIC-009-M010 follow-up — owner-reported click bug.)
            className="pointer-events-auto fixed z-[var(--z-dropdown)] overflow-hidden rounded-md border border-border bg-surface shadow-lg"
            style={{ left: anchor.left, top: anchor.top, width: anchor.width }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-fg-muted">{emptyMessage}</div>
            ) : (
              <ul
                id={listId}
                ref={listRef}
                role="listbox"
                className="max-h-72 overflow-y-auto py-1"
              >
                {filtered.map((option, index) => {
                  const isSelected = option.value === value;
                  const isActive = index === activeIndex;
                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        // Pointer-down (not click) so the choice lands before the input's blur closes us.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          choose(option);
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          "flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface-muted [[data-surface=tablet]_&]:py-3",
                          isActive && "bg-surface-muted",
                        )}
                      >
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 text-accent",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium text-fg">{option.label}</span>
                          {option.sublabel !== undefined && (
                            <span className="truncate text-xs text-fg-muted [[data-surface=tablet]_&]:text-sm">
                              {option.sublabel}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        autoComplete="off"
        disabled={disabled}
        invalid={invalid}
        value={fieldValue}
        placeholder={placeholder}
        className="pr-9"
        onChange={(e) => {
          setQuery(e.target.value);
          if (open === false) setOpen(true);
        }}
        onFocus={openList}
        onMouseDown={() => {
          if (open === false) openList();
        }}
        onKeyDown={onKeyDown}
      />
      <ChevronsUpDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden="true"
      />
      {listbox}
    </div>
  );
}
