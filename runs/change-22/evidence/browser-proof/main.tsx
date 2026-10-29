// CR-DESIGN-SYSTEM-024 — browser proof page: the REAL TablePagination from src/ (English default and
// Portuguese labels), both placements, nothing stubbed.
import { useState } from "react";
import { createRoot } from "react-dom/client";

import { TablePagination } from "../../../../src";
import type { TablePageState, TablePaginationLabels } from "../../../../src";

const PT: Partial<TablePaginationLabels> = {
  previous: "Anterior",
  next: "Seguinte",
  rowsPerPage: "Linhas por página",
  listPaging: "Paginação da lista",
  listPagingEnd: "Paginação da lista, fim da lista",
  range: ({ position, total }) => (
    <>
      {"A mostrar "}
      <span className="font-medium text-fg">{position}</span>
      {" de "}
      <span className="font-medium text-fg">{total}</span>
    </>
  ),
};

function List({ id, labels }: { id: string; labels?: Partial<TablePaginationLabels> }) {
  const [paging, setPaging] = useState<TablePageState>({ page: 1, pageSize: 25 });
  const props = { ...paging, totalCount: 312, onChange: setPaging, labels };
  return (
    <section id={id} className="mb-8 rounded-lg border border-border bg-surface p-4">
      <TablePagination placement="top" {...props} />
      <div className="rounded-md border border-border p-4 text-sm text-fg-muted">table rows</div>
      <TablePagination placement="bottom" {...props} />
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <main className="mx-auto max-w-3xl bg-bg p-4 text-fg">
    <List id="english" />
    <List id="portuguese" labels={PT} />
  </main>,
);
