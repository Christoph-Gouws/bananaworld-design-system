import { afterEach, describe, expect, it, vi } from "vitest";
import {
  currentGroupId,
  headingCount,
  isMenuItemCurrent,
  nameWithCount,
  readMenuMode,
  visibleMenuGroups,
  visibleTopItems,
  writeMenuMode,
  type AppMenuGroup,
} from "../../src/components/app-menu";

// CR-DESIGN-SYSTEM-032 — the pure rules behind the app frame's menu.

const MENU: AppMenuGroup[] = [
  {
    id: "loads",
    label: "Loads",
    icon: null,
    items: [
      { id: "a", label: "Waiting", href: "/loads/waiting", count: 2 },
      { id: "b", label: "Secret", href: "/loads/secret", count: 9, hidden: true },
      { id: "c", label: "All", href: "/loads", exact: true, count: null },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: null,
    items: [{ id: "d", label: "Users", href: "/admin/users", hidden: true }],
  },
];

describe("visibleMenuGroups", () => {
  it("drops hidden items and any group left with none", () => {
    const groups = visibleMenuGroups(MENU);
    expect(groups.map((g) => g.id)).toEqual(["loads"]);
    expect(groups[0]!.items.map((i) => i.id)).toEqual(["a", "c"]);
  });
});

describe("headingCount", () => {
  it("sums only the visible items", () => {
    expect(headingCount(MENU[0]!)).toBe(2);
  });
  it("lets group.count override the roll-up, and treats 0/null/undefined as nothing", () => {
    expect(headingCount({ ...MENU[0]!, count: 7 })).toBe(7);
    expect(headingCount({ ...MENU[0]!, count: 0 })).toBe(0);
    expect(headingCount({ ...MENU[0]!, count: null })).toBe(0);
    expect(headingCount({ ...MENU[1]!, items: [{ id: "x", label: "x", href: "/x" }] })).toBe(0);
  });
});

describe("current screen", () => {
  it("matches the path or anything under it, exact only on equality", () => {
    const [waiting, all] = [MENU[0]!.items[0]!, MENU[0]!.items[2]!];
    expect(isMenuItemCurrent(waiting, "/loads/waiting")).toBe(true);
    expect(isMenuItemCurrent(waiting, "/loads/waiting/42")).toBe(true);
    expect(isMenuItemCurrent(waiting, "/loads/waitingroom")).toBe(false);
    expect(isMenuItemCurrent(all, "/loads")).toBe(true);
    expect(isMenuItemCurrent(all, "/loads/waiting")).toBe(false);
  });
  it("finds the group of the longest match, or null", () => {
    const groups = visibleMenuGroups(MENU);
    expect(currentGroupId(groups, "/loads/waiting/3")).toBe("loads");
    expect(currentGroupId(groups, "/elsewhere")).toBeNull();
  });
});

describe("nameWithCount", () => {
  it("adds the number only when there is one", () => {
    expect(nameWithCount("Loads", 2)).toBe("Loads 2");
    expect(nameWithCount("Loads", 0)).toBe("Loads");
  });
});

describe("menu mode memory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });
  it("reads rail, and anything else as open", () => {
    expect(readMenuMode("k")).toBe("open");
    window.localStorage.setItem("k", "rail");
    expect(readMenuMode("k")).toBe("rail");
    window.localStorage.setItem("k", "junk");
    expect(readMenuMode("k")).toBe("open");
  });
  it("survives a storage that throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readMenuMode("k")).toBe("open");
    expect(() => writeMenuMode("k", "rail")).not.toThrow();
  });
});

// CR-DESIGN-SYSTEM-034 — items above the first heading.
describe("top items", () => {
  const dash = { id: "dash", label: "Dashboard", href: "/dashboard", icon: null };

  it("visibleTopItems drops hidden items and turns absent into []", () => {
    expect(visibleTopItems(undefined)).toEqual([]);
    expect(visibleTopItems([])).toEqual([]);
    expect(visibleTopItems([dash, { ...dash, id: "h", hidden: true }])).toEqual([dash]);
    expect(visibleTopItems([{ ...dash, hidden: true }])).toEqual([]);
  });

  it("is current by isMenuItemCurrent: exact only on equality, otherwise sub-paths count too", () => {
    const exact = { ...dash, exact: true };
    expect(isMenuItemCurrent(exact, "/dashboard")).toBe(true);
    expect(isMenuItemCurrent(exact, "/dashboard/x")).toBe(false);
    expect(isMenuItemCurrent(dash, "/dashboard/x")).toBe(true);
    expect(isMenuItemCurrent(dash, "/dashboards")).toBe(false);
  });
});
