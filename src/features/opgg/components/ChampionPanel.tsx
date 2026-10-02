/** @jsxImportSource solid-js */
import { children, type JSX, Show } from "solid-js";
import { ScrollArea } from "@/components/scroll-area";
import { SettingsSectionCard } from "@/components/settings-ui";
import * as s from "./ChampionPanel.css";

// Both configuration and table viewports end at the card's content edge. Their
// outset tracks share the gutter reserved by the panel's trailing padding.
// Flowing panels delegate scrolling to the detail viewport.
export function ChampionPanel(props: {
  ariaLabel: string;
  title?: string;
  scrollable?: boolean;
  flowing: boolean;
  children: JSX.Element;
}) {
  const content = children(() => props.children);
  const bounded = () => !props.flowing;

  return (
    <section
      class={s.frame({ flowing: props.flowing })}
      aria-label={props.ariaLabel}
    >
      <SettingsSectionCard
        className={s.card({ bounded: bounded() })}
        bodyClassName={s.body({ bounded: bounded() })}
      >
        <div
          class={s.region({ titled: Boolean(props.title), bounded: bounded() })}
        >
          <Show when={props.title}>
            {(title) => <h3 class={s.title}>{title()}</h3>}
          </Show>
          <Show when={props.scrollable} fallback={content()}>
            <ScrollArea
              disabled={props.flowing}
              className={s.scroller}
              contentClassName={s.scrollContent}
              viewportClassName={s.viewport({ flowing: props.flowing })}
              direction="vertical"
              mode="outset"
            >
              {content()}
            </ScrollArea>
          </Show>
        </div>
      </SettingsSectionCard>
    </section>
  );
}
