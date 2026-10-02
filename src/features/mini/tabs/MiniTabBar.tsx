/** @jsxImportSource solid-js */
import { Menu } from "@ark-ui/solid/menu";
import { Tabs } from "@ark-ui/solid/tabs";
import { Key } from "@solid-primitives/keyed";
import { Check, Ellipsis } from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { AppTooltip } from "@/components/AppTooltip";
import { useSolidTranslation } from "@/i18n/solid";
import { useMiniTabs } from "./MiniTabs";
import * as s from "./MiniTabs.css";
import { partitionMiniTabs } from "./state";
import type { MiniTabEntry } from "./types";

// Tooltip and Tabs both own trigger IDs. A wrapper keeps their ARIA identities
// separate so Tabs can still locate and focus the real button with arrow keys.
function MiniTabTrigger(props: { entry: MiniTabEntry }) {
  const { t } = useSolidTranslation();
  const label = () =>
    props.entry.reasonKey
      ? t(props.entry.reasonKey)
      : t(props.entry.definition.titleKey);
  return (
    <AppTooltip content={label()} placement="bottom-start">
      {(triggerProps) => (
        <span {...triggerProps<HTMLSpanElement>({ class: s.triggerWrapper })}>
          <Tabs.Trigger
            class={s.trigger}
            aria-label={props.entry.definition.ariaLabel}
            aria-description={props.entry.reasonKey ? label() : undefined}
            value={props.entry.id}
            aria-disabled={!props.entry.enabled}
          >
            <props.entry.definition.icon size={16} aria-hidden="true" />
          </Tabs.Trigger>
        </span>
      )}
    </AppTooltip>
  );
}

function MiniTabOverflow(props: { entries: MiniTabEntry[] }) {
  const tabs = useMiniTabs();
  const { t } = useSolidTranslation();
  const selected = () =>
    props.entries.some((entry) => entry.id === tabs.activeId());
  return (
    <Menu.Root
      lazyMount
      unmountOnExit
      positioning={{ placement: "bottom-start" }}
      onSelect={({ value }) => tabs.select(value)}
    >
      <Menu.Trigger
        class={s.trigger}
        aria-label="More mini pages"
        aria-pressed={selected()}
      >
        <Ellipsis size={16} aria-hidden="true" />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner class={s.menuPositioner}>
          <Menu.Content class={s.menu} aria-label="More mini pages">
            <For each={props.entries}>
              {(entry) => (
                <Menu.Item
                  value={entry.id}
                  disabled={!entry.enabled}
                  class={s.menuItem}
                >
                  <entry.definition.icon size={16} aria-hidden="true" />
                  <span class={s.menuLabel}>
                    {t(entry.definition.titleKey)}
                    <Show when={entry.reasonKey}>
                      {(key) => <span class={s.reason}>{t(key())}</span>}
                    </Show>
                  </span>
                  <Show when={tabs.activeId() === entry.id}>
                    <Check size={14} aria-hidden="true" />
                  </Show>
                </Menu.Item>
              )}
            </For>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

export function MiniTabBar() {
  const tabs = useMiniTabs();
  const groups = createMemo(() => partitionMiniTabs(tabs.entries()));
  return (
    <nav class={s.navigation} aria-label="Mini pages">
      <Tabs.List class={s.list} aria-label="Mini pages">
        <Key each={groups().visible} by="id">
          {(entry) => <MiniTabTrigger entry={entry()} />}
        </Key>
      </Tabs.List>
      <Show when={groups().overflow.length > 0}>
        <MiniTabOverflow entries={groups().overflow} />
      </Show>
    </nav>
  );
}
