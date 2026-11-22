import type { ReactNode } from "react";

// CR-DESIGN-SYSTEM-032 — the pure half of the app frame: the menu data shapes and the rules that
// read them. No React, no DOM except the two storage helpers. Every one of the three menu modes
// (open, rail, slide-out) renders from `visibleMenuGroups` and only from it (plan D-6).

export interface AppMenuItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** Current only on an exact path match. Default: the path or anything under it. */
  readonly exact?: boolean;
  /** The app's own decision (role, switch). Hidden items are never rendered and never counted. */
  readonly hidden?: boolean;
  /** A waiting count. null, undefined or 0 shows nothing. */
  readonly count?: number | null;
}

export interface AppMenuGroup {
  readonly id: string;
  readonly label: string;
  /** The heading's icon. The app passes its own. Items carry none. */
  readonly icon: ReactNode;
  readonly items: readonly AppMenuItem[];
  /** Overrides the roll-up. Default: the sum of the VISIBLE items' counts. */
  readonly count?: number | null;
}

export interface AppMenuFootItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: ReactNode;
  readonly hidden?: boolean;
}

export type AppMenuMode = "open" | "rail";

export const DEFAULT_MENU_STORAGE_KEY = "bw.app-shell.menu";

/** A group with its hidden items removed; a group left with none is dropped. */
export function visibleMenuGroups(menu: readonly AppMenuGroup[]): AppMenuGroup[] {
  return menu
    .map((group) => ({ ...group, items: group.items.filter((item) => item.hidden !== true) }))
    .filter((group) => group.items.length > 0);
}

function pathOf(href: string): string {
  const cut = href.search(/[?#]/);
  return cut === -1 ? href : href.slice(0, cut);
}

export function isMenuItemCurrent(item: AppMenuItem, pathname: string): boolean {
  const target = pathOf(item.href);
  if (pathname === target) return true;
  if (item.exact === true) return false;
  return pathname.startsWith(target.endsWith("/") ? target : `${target}/`);
}

/** The id of the group holding the current screen (the longest matching href wins), or null. */
export function currentGroupId(groups: readonly AppMenuGroup[], pathname: string): string | null {
  let best: { id: string; length: number } | null = null;
  for (const group of groups) {
    for (const item of group.items) {
      if (!isMenuItemCurrent(item, pathname)) continue;
      const length = pathOf(item.href).length;
      if (best === null || length > best.length) best = { id: group.id, length };
    }
  }
  return best === null ? null : best.id;
}

export function positiveCount(count: number | null | undefined): number {
  return typeof count === "number" && count > 0 ? count : 0;
}

/** A heading's number: its own `count` if given, otherwise the sum of its visible items. */
export function headingCount(group: AppMenuGroup): number {
  if (group.count !== undefined) return positiveCount(group.count);
  return group.items
    .filter((item) => item.hidden !== true)
    .reduce((sum, item) => sum + positiveCount(item.count), 0);
}

/** "label n" when there is a number, else the label alone. */
export function nameWithCount(label: string, count: number): string {
  return count > 0 ? `${label} ${String(count)}` : label;
}

/** Anything but "rail", or a storage that throws, means open. */
export function readMenuMode(storageKey: string): AppMenuMode {
  try {
    return window.localStorage.getItem(storageKey) === "rail" ? "rail" : "open";
  } catch {
    return "open";
  }
}

export function writeMenuMode(storageKey: string, mode: AppMenuMode): void {
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Storage blocked: the choice simply is not remembered.
  }
}
