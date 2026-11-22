"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { cn } from "../lib";
import { Link } from "./Link";

/**
 * UserMenu — the name menu in the app frame's header (CR-DESIGN-SYSTEM-032). Radix DropdownMenu, the
 * pattern of the DC's own UserMenu. Every word comes from props; the kit decides nothing about who
 * the person is or what signing out does.
 */
export interface UserMenuLanguage {
  readonly label: string;
  readonly value: string;
  readonly options: readonly { readonly id: string; readonly name: string }[];
  readonly onChange: (id: string) => void;
}

export interface UserMenuProps {
  readonly name: string;
  readonly initials: string;
  /** The accessible name of the trigger button. */
  readonly triggerLabel: string;
  readonly rolesLine?: string;
  /** e.g. "2-step sign-in on". null or undefined shows no mark. */
  readonly secondStep?: string | null;
  readonly settings?: { readonly href: string; readonly label: string; readonly hint?: string };
  readonly language?: UserMenuLanguage;
  readonly signOut: { readonly label: string; readonly onSelect: () => void };
}

const ITEM =
  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-fg outline-none data-[highlighted]:bg-surface-muted";

function LanguageSegments({ language }: { language: UserMenuLanguage }) {
  return (
    <div className="px-2 py-1.5">
      <DropdownMenu.Label className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
        {language.label}
      </DropdownMenu.Label>
      <DropdownMenu.RadioGroup
        value={language.value}
        onValueChange={language.onChange}
        className="flex rounded-md border border-border p-0.5"
      >
        {language.options.map((option) => (
          <DropdownMenu.RadioItem
            key={option.id}
            value={option.id}
            // Keep the menu open so the new choice shows (the value still changes).
            onSelect={(event) => event.preventDefault()}
            className={cn(
              "flex flex-1 cursor-pointer select-none items-center justify-center rounded-sm px-2 py-1 text-sm outline-none",
              "text-fg-muted data-[highlighted]:bg-surface-muted",
              "data-[state=checked]:bg-accent data-[state=checked]:font-semibold data-[state=checked]:text-fg-on-accent",
            )}
          >
            {option.name}
          </DropdownMenu.RadioItem>
        ))}
      </DropdownMenu.RadioGroup>
    </div>
  );
}

function IdentityBlock(props: Pick<UserMenuProps, "name" | "rolesLine" | "secondStep">) {
  const { name, rolesLine, secondStep } = props;
  return (
    <div className="px-2 py-1.5">
      <p className="truncate text-sm font-medium text-fg">{name}</p>
      {rolesLine != null && <p className="text-xs text-fg-muted">{rolesLine}</p>}
      {secondStep != null && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-success-fg">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {secondStep}
        </p>
      )}
    </div>
  );
}

function MenuTrigger(props: { name: string; initials: string; label: string }) {
  return (
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        // Contains the visible name (WCAG 2.5.3 label in name), then says what the button is.
        aria-label={`${props.name} · ${props.label}`}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-border px-2 text-sm text-fg lg:px-3",
          "hover:bg-surface-muted data-[state=open]:border-accent data-[state=open]:bg-surface-muted",
          "focus-visible:outline-none focus-visible:shadow-focus",
        )}
      >
        {/* Initials as generated content, not text: they are decoration, and as text they would
            count as visible words the button's name must contain. */}
        <span
          aria-hidden="true"
          data-initials={props.initials}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-fg-on-accent after:content-[attr(data-initials)]"
        />
        <span className="hidden max-w-[180px] truncate lg:inline">{props.name}</span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 text-fg-subtle" />
      </button>
    </DropdownMenu.Trigger>
  );
}

export function UserMenu(props: UserMenuProps) {
  const { name, initials, triggerLabel, settings, language, signOut } = props;
  return (
    <DropdownMenu.Root>
      <MenuTrigger name={name} initials={initials} label={triggerLabel} />
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-[var(--z-dropdown)] min-w-[16rem] overflow-hidden rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          <IdentityBlock name={name} rolesLine={props.rolesLine} secondStep={props.secondStep} />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {settings && (
            <DropdownMenu.Item asChild>
              <Link href={settings.href} className={cn(ITEM, "no-underline hover:text-fg")}>
                <Settings aria-hidden="true" className="h-4 w-4 text-fg-muted" />
                <span className="flex-1">{settings.label}</span>
                {settings.hint != null && (
                  <span className="text-xs text-fg-subtle">{settings.hint}</span>
                )}
              </Link>
            </DropdownMenu.Item>
          )}
          {language && <LanguageSegments language={language} />}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            onSelect={() => signOut.onSelect()}
            className={cn(ITEM, "text-danger")}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {signOut.label}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
