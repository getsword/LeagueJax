/** @jsxImportSource solid-js */
import { Check, Loader } from "lucide-solid";
import type { ComponentProps, JSX } from "solid-js";
import { createSignal, onCleanup, splitProps } from "solid-js";
import { FadingLabel } from "@/components/FadingLabel";
import * as s from "./SettingsActionButton.css.ts";
import {
  type SettingsControlProps,
  settingsControlClassName,
  settingsControlLayoutKeys,
  settingsControlStyle,
} from "./SettingsControl";

const defaultSuccessFeedbackDurationMs = 1000;

interface SettingsActionButtonOwnProps {
  ariaLabel: string;
  label: string;
  onClick: () => Promise<void>;
  loading?: boolean;
  minLoadingMs?: number;
  successFeedback?: boolean;
  onError?: (error: unknown) => void;
  tone?: "accent" | "neutral" | "quiet";
}

export type SettingsActionButtonProps = SettingsControlProps<
  ComponentProps<"button">,
  SettingsActionButtonOwnProps,
  "type" | "aria-label"
>;

export function SettingsActionButton(
  props: SettingsActionButtonProps,
): JSX.Element {
  const [layout, local, buttonProps] = splitProps(
    props,
    settingsControlLayoutKeys,
    [
      "ariaLabel",
      "label",
      "onClick",
      "loading",
      "minLoadingMs",
      "successFeedback",
      "onError",
      "tone",
    ],
  );
  const [pending, setPending] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  let successTimer: number | null = null;
  const busy = () => pending() || (local.loading ?? false);

  onCleanup(() => {
    if (successTimer !== null) {
      window.clearTimeout(successTimer);
    }
  });

  const handleClick = async () => {
    if (busy() || (buttonProps.disabled ?? false)) {
      return;
    }

    if (successTimer !== null) {
      window.clearTimeout(successTimer);
      successTimer = null;
    }
    setShowSuccess(false);

    const startedAt = performance.now();
    setPending(true);
    let completedSuccessfully = false;

    try {
      await local.onClick();
      completedSuccessfully = true;
    } catch (error) {
      local.onError?.(error);
    } finally {
      const elapsedMs = performance.now() - startedAt;
      const remainingMs = Math.max(0, (local.minLoadingMs ?? 0) - elapsedMs);
      if (remainingMs > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, remainingMs);
        });
      }
      setPending(false);

      if (completedSuccessfully && (local.successFeedback ?? false)) {
        setShowSuccess(true);
        successTimer = window.setTimeout(() => {
          setShowSuccess(false);
          successTimer = null;
        }, defaultSuccessFeedbackDurationMs);
      }
    }
  };

  return (
    <button
      {...buttonProps}
      type="button"
      aria-label={local.ariaLabel}
      class={`${settingsControlClassName(layout)} ${s.tone[local.tone ?? "accent"]}`}
      style={settingsControlStyle(layout)}
      disabled={busy() || (buttonProps.disabled ?? false)}
      onClick={() => {
        void handleClick();
      }}
    >
      <FadingLabel text={local.label} />
      <span class={s.loaderSlot} aria-hidden="true">
        <Loader
          size={14}
          class={`${s.feedbackIconBase} ${busy() ? s.feedbackIconVisible : ""} ${busy() ? s.iconSpin : ""}`}
        />
        <Check
          size={14}
          class={`${s.feedbackIconBase} ${showSuccess() ? s.feedbackIconVisible : ""}`}
        />
      </span>
    </button>
  );
}
