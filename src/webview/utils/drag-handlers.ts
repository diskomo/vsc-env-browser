export interface DragState {
  draggedElement: HTMLElement | null;
  draggedIndex: number | null;
}

export function createDragHandlers(
  dragState: DragState,
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  function handleDragStart(e: DragEvent) {
    if (!e.target) return;
    const row = (e.target as HTMLElement).closest(
      ".variable-row"
    ) as HTMLElement;
    if (!row) return;

    dragState.draggedElement = row;
    dragState.draggedIndex = Number.parseInt(
      row.dataset.variableIndex || "0",
      10
    );

    row.classList.add("dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", "");
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!e.target || !dragState.draggedElement) return;

    const row = (e.target as HTMLElement).closest(
      ".variable-row"
    ) as HTMLElement;
    if (!row || row === dragState.draggedElement) return;

    const allRows = document.querySelectorAll<HTMLElement>(".variable-row");
    for (let i = 0; i < allRows.length; i++) {
      if (allRows[i] !== row) {
        allRows[i].classList.remove("drag-over-top", "drag-over-bottom");
      }
    }

    const rect = row.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (e.clientY < midpoint) {
      row.classList.add("drag-over-top");
      row.classList.remove("drag-over-bottom");
    } else {
      row.classList.add("drag-over-bottom");
      row.classList.remove("drag-over-top");
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (
      !e.target ||
      !dragState.draggedElement ||
      dragState.draggedIndex === null
    )
      return;

    const row = (e.target as HTMLElement).closest(
      ".variable-row"
    ) as HTMLElement;
    if (!row || row === dragState.draggedElement) return;

    const targetIndex = Number.parseInt(row.dataset.variableIndex || "0", 10);
    const isBefore = row.classList.contains("drag-over-top");

    onReorder(
      dragState.draggedIndex,
      isBefore ? targetIndex : targetIndex + 1
    );
  }

  function handleDragEnd() {
    const rows = document.querySelectorAll<HTMLElement>(".variable-row");
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.remove("dragging", "drag-over-top", "drag-over-bottom");
    }
    dragState.draggedElement = null;
    dragState.draggedIndex = null;
  }

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}

export function attachDragListeners(
  rows: NodeListOf<HTMLElement>,
  handlers: ReturnType<typeof createDragHandlers>
) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    row.addEventListener("dragstart", handlers.handleDragStart);
    row.addEventListener("dragover", handlers.handleDragOver);
    row.addEventListener("drop", handlers.handleDrop);
    row.addEventListener("dragend", handlers.handleDragEnd);
  }
}

