export interface MiniTabStateEntry {
  id: string;
  enabled: boolean;
}

export function sortMiniTabs<T extends { id: string; order: number }>(
  tabs: readonly T[],
): T[] {
  const ids = new Set<string>();
  for (const tab of tabs) {
    if (ids.has(tab.id)) throw new Error(`Duplicate mini tab: ${tab.id}`);
    ids.add(tab.id);
  }
  return [...tabs].sort((left, right) => left.order - right.order);
}

// Availability changes may invalidate a selection, but must never activate a
// newly enabled page on the user's behalf. The host commits the returned ID.
export function resolveMiniTabSelection(
  selectedId: string | null,
  tabs: readonly MiniTabStateEntry[],
  defaultId: string,
): string | null {
  const available = tabs.filter((tab) => tab.enabled);
  return (
    available.find((tab) => tab.id === selectedId)?.id ??
    available.find((tab) => tab.id === defaultId)?.id ??
    available[0]?.id ??
    null
  );
}

export function partitionMiniTabs<T>(tabs: readonly T[]) {
  return { visible: tabs.slice(0, 3), overflow: tabs.slice(3) };
}
