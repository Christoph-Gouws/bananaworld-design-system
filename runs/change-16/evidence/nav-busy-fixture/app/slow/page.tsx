export const dynamic = "force-dynamic";

export default async function Slow() {
  await new Promise((r) => setTimeout(r, 1500));
  return <h1 id="title" className="text-2xl font-semibold">Slow page</h1>;
}
