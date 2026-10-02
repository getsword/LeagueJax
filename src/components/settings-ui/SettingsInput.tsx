/** @jsxImportSource solid-js */
import { NumberInput } from "@ark-ui/solid/number-input";
import type { ComponentProps, JSX } from "solid-js";
import { Match, Switch, splitProps } from "solid-js";
import {
  type SettingsControlProps,
  type SettingsControlSlotProps,
  settingsControlClassName,
  settingsControlLayoutKeys,
  settingsControlStyle,
} from "./SettingsControl";
import * as s from "./SettingsInput.css";

interface SettingsInputValueProps {
  ariaLabel: string;
  value: string;
  onValueChange: (value: string) => void;
}

type SettingsTextInputProps = SettingsControlProps<
  ComponentProps<"input">,
  SettingsInputValueProps & { type: "text" },
  "defaultValue" | "onInput" | "aria-label"
>;

type SettingsNumberInputProps = SettingsControlProps<
  NumberInput.RootProps,
  SettingsInputValueProps & {
    type: "number";
    placeholder?: NumberInput.InputProps["placeholder"];
    inputProps?: SettingsControlSlotProps<
      NumberInput.InputProps,
      | "value"
      | "defaultValue"
      | "type"
      | "name"
      | "form"
      | "min"
      | "max"
      | "step"
      | "disabled"
      | "readOnly"
      | "readonly"
      | "required"
      | "inputMode"
      | "inputmode"
      | "aria-label"
    >;
  },
  "defaultValue"
>;

export type SettingsInputProps =
  | SettingsTextInputProps
  | SettingsNumberInputProps;

function SettingsTextInput(props: SettingsTextInputProps): JSX.Element {
  const [layout, local, inputProps] = splitProps(
    props,
    settingsControlLayoutKeys,
    ["ariaLabel", "type", "value", "onValueChange"],
  );

  return (
    <input
      {...inputProps}
      aria-label={local.ariaLabel}
      class={`${settingsControlClassName(layout)} ${s.input}`}
      style={settingsControlStyle(layout)}
      type="text"
      value={local.value}
      onInput={(event) => local.onValueChange(event.currentTarget.value)}
    />
  );
}

// Ark's Root owns form state, while inputProps targets only the editable input node.
function SettingsNumberInput(props: SettingsNumberInputProps): JSX.Element {
  const [layout, local, rootProps] = splitProps(
    props,
    settingsControlLayoutKeys,
    ["ariaLabel", "type", "placeholder", "inputProps", "onValueChange"],
  );

  return (
    <NumberInput.Root
      {...rootProps}
      class={`${settingsControlClassName(layout)} ${s.numberRoot}`}
      style={settingsControlStyle(layout)}
      inputMode={rootProps.inputMode ?? "numeric"}
      onValueChange={(details) => local.onValueChange(details.value)}
    >
      <NumberInput.Input
        {...local.inputProps}
        aria-label={local.ariaLabel}
        class={s.numberInput}
        placeholder={local.inputProps?.placeholder ?? local.placeholder}
      />
      <NumberInput.Control class={s.numberControl}>
        <NumberInput.DecrementTrigger
          class={`${s.numberTrigger} ${s.numberTriggerDecrement}`}
          aria-label={`${local.ariaLabel} decrease`}
        >
          -
        </NumberInput.DecrementTrigger>
        <NumberInput.IncrementTrigger
          class={`${s.numberTrigger} ${s.numberTriggerIncrement}`}
          aria-label={`${local.ariaLabel} increase`}
        >
          +
        </NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  );
}

// Keep each branch's native props separate, including when the input type changes reactively.
export function SettingsInput(props: SettingsInputProps): JSX.Element {
  return (
    <Switch>
      <Match when={props.type === "number" ? props : undefined} keyed>
        {(numberProps) => <SettingsNumberInput {...numberProps} />}
      </Match>
      <Match when={props.type === "text" ? props : undefined} keyed>
        {(textProps) => <SettingsTextInput {...textProps} />}
      </Match>
    </Switch>
  );
}
