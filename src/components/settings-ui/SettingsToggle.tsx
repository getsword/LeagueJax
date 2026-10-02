/** @jsxImportSource solid-js */
import type { ComponentProps, JSX } from "solid-js";
import { splitProps } from "solid-js";
import {
  type SettingsControlProps,
  settingsControlClassName,
  settingsControlLayoutKeys,
  settingsControlStyle,
} from "./SettingsControl";
import * as s from "./SettingsSwitch.css";

interface SettingsToggleOwnProps {
  ariaLabel: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export type SettingsToggleProps = SettingsControlProps<
  ComponentProps<"button">,
  SettingsToggleOwnProps,
  "type" | "role" | "aria-label" | "aria-checked" | "onClick"
>;

export function SettingsToggle(props: SettingsToggleProps): JSX.Element {
  const [layout, local, buttonProps] = splitProps(
    props,
    settingsControlLayoutKeys,
    ["ariaLabel", "checked", "onCheckedChange"],
  );

  return (
    <button
      {...buttonProps}
      type="button"
      role="switch"
      aria-label={local.ariaLabel}
      aria-checked={local.checked}
      data-disabled={buttonProps.disabled ? "" : undefined}
      class={`${settingsControlClassName(layout)} ${s.button({ checked: local.checked })}`}
      style={settingsControlStyle(layout)}
      onClick={() => local.onCheckedChange(!local.checked)}
    >
      <span class={s.text}>{local.checked ? "On" : "Off"}</span>
      <span class={s.track({ checked: local.checked })}>
        <span class={s.thumb} />
      </span>
    </button>
  );
}
