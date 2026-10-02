/** @jsxImportSource solid-js */
import { ColorPicker, parseColor } from "@ark-ui/solid/color-picker";
import { Key } from "@solid-primitives/keyed";
import { Pipette } from "lucide-solid";
import type { JSX } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { useSolidTranslation } from "@/i18n/solid";
import * as s from "./SettingsColorPicker.css.ts";
import {
  type SettingsControlProps,
  type SettingsControlSlotProps,
  settingsControlClassName,
  settingsControlLayoutKeys,
  settingsControlStyle,
} from "./SettingsControl";

const HEX_COLOR_WITH_OPTIONAL_ALPHA = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const TRANSPARENT_HEX_COLOR = "#00000000";

type ColorPickerOutputFormat = "hex" | "hexa";
type ColorPickerVariant = "default" | "compact";

interface SettingsColorPickerOwnProps {
  ariaLabel: string;
  livePreview?: boolean;
  outputFormat?: ColorPickerOutputFormat;
  value: string;
  presets?: string[];
  presetsLabel?: string;
  respectAlpha?: boolean;
  triggerSettingId?: string;
  triggerTitle?: string;
  variant?: ColorPickerVariant;
  onValueChange: (value: string) => void;
  triggerProps?: SettingsControlSlotProps<
    ColorPicker.TriggerProps,
    "aria-label"
  >;
  hiddenInputProps?: SettingsControlSlotProps<
    ColorPicker.HiddenInputProps,
    "value" | "defaultValue" | "type" | "name" | "form" | "disabled"
  >;
}

export type SettingsColorPickerProps = SettingsControlProps<
  ColorPicker.RootProps,
  SettingsColorPickerOwnProps,
  "defaultValue" | "format" | "defaultFormat" | "onFormatChange"
>;

function normalizeHexColor(
  value: unknown,
  fallback = TRANSPARENT_HEX_COLOR,
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return HEX_COLOR_WITH_OPTIONAL_ALPHA.test(normalized)
    ? normalized.toUpperCase()
    : fallback;
}

function toColorValue(value: string) {
  return parseColor(normalizeHexColor(value));
}

function toHexColor(
  value: { toString: (format: ColorPickerOutputFormat) => string },
  outputFormat: ColorPickerOutputFormat,
): string {
  return normalizeHexColor(value.toString(outputFormat));
}

export function SettingsColorPicker(
  props: SettingsColorPickerProps,
): JSX.Element {
  const [layout, local, rootProps] = splitProps(
    props,
    settingsControlLayoutKeys,
    [
      "ariaLabel",
      "livePreview",
      "outputFormat",
      "value",
      "presets",
      "presetsLabel",
      "respectAlpha",
      "triggerSettingId",
      "triggerTitle",
      "variant",
      "onValueChange",
      "onValueChangeEnd",
      "triggerProps",
      "hiddenInputProps",
    ],
  );
  const { t } = useSolidTranslation();
  const outputFormat = () => local.outputFormat ?? "hexa";
  const normalizedValue = createMemo(() => normalizeHexColor(local.value));
  const [colorValue, setColorValue] = createSignal(
    toColorValue(normalizedValue()),
  );
  const normalizedPresets = createMemo(() =>
    (local.presets ?? []).map((preset) => normalizeHexColor(preset)),
  );

  createEffect(() => {
    setColorValue((currentColor) => {
      if (toHexColor(currentColor, outputFormat()) === normalizedValue()) {
        return currentColor;
      }

      return toColorValue(normalizedValue());
    });
  });

  const commitColor = (nextColor = colorValue()) => {
    local.onValueChange(toHexColor(nextColor, outputFormat()));
  };

  const commitPreset = (preset: string) => {
    const nextColor = toColorValue(preset);

    setColorValue(nextColor);
    commitColor(nextColor);
  };

  return (
    <ColorPicker.Root
      {...rootProps}
      lazyMount={rootProps.lazyMount ?? true}
      unmountOnExit={rootProps.unmountOnExit ?? true}
      class={settingsControlClassName(layout)}
      style={settingsControlStyle(layout)}
      format="hsba"
      positioning={{
        placement: "bottom-end",
        gutter: 6,
        ...rootProps.positioning,
      }}
      value={colorValue()}
      onValueChange={(details) => {
        setColorValue(details.value);
        if (local.livePreview ?? false) {
          commitColor(details.value);
        }
      }}
      onValueChangeEnd={(details) => {
        if (!(local.livePreview ?? false)) {
          commitColor(details.value);
        }
        local.onValueChangeEnd?.(details);
      }}
    >
      <ColorPicker.Label class={s.label}>{local.ariaLabel}</ColorPicker.Label>
      <ColorPicker.Control class={s.control}>
        <ColorPicker.Trigger
          {...local.triggerProps}
          aria-label={local.ariaLabel}
          class={s.trigger({ variant: local.variant ?? "default" })}
          data-setting-id={local.triggerSettingId}
          title={local.triggerProps?.title ?? local.triggerTitle}
        >
          <ColorPicker.ValueSwatch
            class={s.valueSwatch}
            respectAlpha={local.respectAlpha ?? true}
          />
        </ColorPicker.Trigger>
      </ColorPicker.Control>
      <Portal>
        <ColorPicker.Positioner class={s.positioner}>
          <ColorPicker.Content
            class={s.content}
            onContextMenu={(event) => {
              event.stopPropagation();
            }}
          >
            <ColorPicker.Area class={s.area}>
              <ColorPicker.AreaBackground class={s.areaBackground} />
              <ColorPicker.AreaThumb class={s.areaThumb} />
            </ColorPicker.Area>
            <div class={s.slidersRow}>
              <ColorPicker.EyeDropperTrigger
                aria-label={`${local.ariaLabel} eyedropper`}
                class={s.eyeDropperTrigger}
              >
                <Pipette size={16} aria-hidden="true" />
              </ColorPicker.EyeDropperTrigger>
              <div class={s.sliderStack}>
                <ColorPicker.ChannelSlider channel="hue" class={s.slider}>
                  <ColorPicker.ChannelSliderTrack class={s.sliderTrack} />
                  <ColorPicker.ChannelSliderThumb class={s.sliderThumb} />
                </ColorPicker.ChannelSlider>
                <ColorPicker.ChannelSlider channel="alpha" class={s.slider}>
                  <ColorPicker.ChannelSliderTrack class={s.sliderTrack} />
                  <ColorPicker.ChannelSliderThumb class={s.sliderThumb} />
                </ColorPicker.ChannelSlider>
              </div>
            </div>
            <div class={s.inputsRow}>
              <ColorPicker.ChannelInput
                aria-label={`${local.ariaLabel} hex`}
                channel="hex"
                class={s.input}
              />
              <ColorPicker.ChannelInput
                aria-label={`${local.ariaLabel} alpha`}
                channel="alpha"
                class={s.input}
              />
            </div>
            <Show when={normalizedPresets().length > 0}>
              <div class={s.presetsLabel}>
                {local.presetsLabel ?? t("settings.colorPicker.presets")}
              </div>
              <ColorPicker.SwatchGroup class={s.swatchGroup}>
                <Key each={normalizedPresets()} by={(preset) => preset}>
                  {(preset) => (
                    <ColorPicker.SwatchTrigger
                      aria-label={`Use preset color ${preset()}`}
                      class={s.swatchTrigger({
                        variant: local.variant ?? "default",
                      })}
                      value={preset()}
                      onClick={() => {
                        commitPreset(preset());
                      }}
                    >
                      <ColorPicker.Swatch
                        class={s.swatch}
                        value={preset()}
                        respectAlpha={local.respectAlpha ?? true}
                      />
                    </ColorPicker.SwatchTrigger>
                  )}
                </Key>
              </ColorPicker.SwatchGroup>
            </Show>
          </ColorPicker.Content>
        </ColorPicker.Positioner>
      </Portal>
      <ColorPicker.HiddenInput {...local.hiddenInputProps} />
    </ColorPicker.Root>
  );
}
