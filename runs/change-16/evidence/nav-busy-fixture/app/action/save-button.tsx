"use client";

import { useFormStatus } from "react-dom";

export function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button id="save" type="submit" className="rounded-md bg-accent px-4 py-2 text-fg-on-accent">
      {pending ? "Working..." : "Save"}
    </button>
  );
}
