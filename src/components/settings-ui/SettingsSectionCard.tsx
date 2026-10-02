/** @jsxImportSource solid-js */
import type { JSX } from "solid-js";
import { Show } from "solid-js";
import * as s from "./SettingsSectionCard.css.ts";

interface SettingsSectionCardProps {
  title?: string;
  contextKey?: string;
  className?: string;
  bodyClassName?: string;
  titleClassName?: string;
  children?: JSX.Element;
}

export function SettingsSectionCard(props: SettingsSectionCardProps) {
  return (
    <section
      class={[s.card, props.className].filter(Boolean).join(" ")}
      data-settings-section-key={props.contextKey}
    >
      <Show when={props.title?.trim()}>
        {(title) => (
          <div
            class={[s.title, props.titleClassName].filter(Boolean).join(" ")}
          >
            {title()}
          </div>
        )}
      </Show>
      <div class={[s.body, props.bodyClassName].filter(Boolean).join(" ")}>
        {props.children}
      </div>
    </section>
  );
}
