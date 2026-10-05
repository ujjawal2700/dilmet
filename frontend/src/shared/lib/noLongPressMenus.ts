const INTERACTIVE = 'a, button, img, [role="button"]';

export function installNoLongPressMenus(): void {
  if (typeof window === "undefined") return;
  const touch = window.matchMedia?.("(pointer: coarse)");
  const onContextMenu = (e: Event) => {
    if (!touch?.matches) return;
    if ((e.target as Element | null)?.closest?.(INTERACTIVE)) e.preventDefault();
  };
  const onDragStart = (e: DragEvent) => {
    if ((e.target as Element | null)?.closest?.("a, img")) e.preventDefault();
  };
  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("dragstart", onDragStart);
}
