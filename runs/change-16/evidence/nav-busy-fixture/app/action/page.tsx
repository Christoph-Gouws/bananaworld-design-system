import { revalidatePath } from "next/cache";
import { SaveButton } from "./save-button";

export const dynamic = "force-dynamic";
let saves = 0;

async function save() {
  "use server";
  saves += 1;
  revalidatePath("/action");
}

// The CR-ORGADMIN-015 shape: a server action that calls revalidatePath, with no loading.tsx above it.
export default function ActionPage() {
  return (
    <div>
      <h1 id="title" className="text-2xl font-semibold">Action page</h1>
      <p id="saves">Saved {saves} times</p>
      <form action={save}>
        <SaveButton />
      </form>
    </div>
  );
}
