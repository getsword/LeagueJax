/** @jsxImportSource solid-js */
import { Tabs } from "@ark-ui/solid/tabs";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  type JSX,
  useContext,
} from "solid-js";
import * as s from "./MiniTabs.css";
import { resolveMiniTabSelection, sortMiniTabs } from "./state";
import type { MiniTabDefinition, MiniTabEntry } from "./types";

// Commit fallback selection so re-enabling a contextual tab does not restore it
// automatically after the user has already been returned to the default page.
function createMiniTabsController(
  tabs: () => readonly MiniTabDefinition[],
  defaultId: string,
) {
  const entries = createMemo<MiniTabEntry[]>(() =>
    sortMiniTabs(tabs()).map((definition) => ({
      definition,
      id: definition.id,
      ...(definition.availability?.() ?? { enabled: true }),
    })),
  );
  const [selectedId, setSelectedId] = createSignal<string | null>(defaultId);
  const activeId = createMemo(() =>
    resolveMiniTabSelection(selectedId(), entries(), defaultId),
  );
  createEffect(() => setSelectedId(activeId()));
  const select = (id: string) => {
    if (entries().some((entry) => entry.id === id && entry.enabled))
      setSelectedId(id);
  };
  return { entries, activeId, select };
}

const MiniTabsContext =
  createContext<ReturnType<typeof createMiniTabsController>>();

export function useMiniTabs() {
  const context = useContext(MiniTabsContext);
  if (!context) throw new Error("MiniTabsProvider is missing");
  return context;
}

// Keep visited panels mounted so tab changes preserve local state and scroll.
// Each page receives active separately to suspend its own background requests.
export function MiniTabsProvider(props: {
  tabs: readonly MiniTabDefinition[];
  defaultId: string;
  children: JSX.Element;
}) {
  const controller = createMiniTabsController(
    () => props.tabs,
    props.defaultId,
  );
  return (
    <MiniTabsContext.Provider value={controller}>
      <Tabs.Root
        class={s.root}
        value={controller.activeId() ?? ""}
        onValueChange={({ value }) => controller.select(value)}
        activationMode="manual"
        lazyMount
        unmountOnExit={false}
      >
        {props.children}
      </Tabs.Root>
    </MiniTabsContext.Provider>
  );
}

// Overflow pages are selected from a menu, so they may not have a mounted tab
// trigger. Give every panel a persistent label independent of the navigation.
export function MiniTabPanels() {
  const tabs = useMiniTabs();
  const labelPrefix = createUniqueId();
  const definitions = createMemo(() =>
    tabs.entries().map((entry) => entry.definition),
  );
  return (
    <div class={s.panels}>
      <For each={definitions()}>
        {(tab) => (
          <Tabs.Content
            value={tab.id}
            class={s.panel}
            aria-label={tab.ariaLabel}
            aria-labelledby={`${labelPrefix}-${tab.id}`}
          >
            <span id={`${labelPrefix}-${tab.id}`} class={s.accessibleLabel}>
              {tab.ariaLabel}
            </span>
            <tab.component active={tabs.activeId() === tab.id} />
          </Tabs.Content>
        )}
      </For>
    </div>
  );
}
