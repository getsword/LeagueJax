import { createSignal, onCleanup, onMount } from "solid-js";

// The sidebar and champion list also consume window width. Observe the detail
// pane itself so column count and scroll ownership change at the same boundary.
export function useChampionLayout() {
  const [stacked, setStacked] = createSignal(false);
  let element: HTMLElement | undefined;

  onMount(() => {
    if (!element) return;
    setStacked(element.getBoundingClientRect().width < 750);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStacked(entry.contentRect.width < 750);
    });
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  return {
    stacked,
    ref: (node: HTMLElement) => {
      element = node;
    },
  };
}
