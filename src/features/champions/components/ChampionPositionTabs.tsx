/** @jsxImportSource solid-js */
import { SegmentGroup } from "@ark-ui/solid/segment-group";
import { For, Show } from "solid-js";
import { AppTooltip } from "@/components/AppTooltip";
import { LeaguePositionIcon } from "@/components/league-position/LeaguePositionIcon";
import { useSolidTranslation } from "@/i18n/solid";
import * as s from "./ChampionPositionTabs.css";

// Keep tooltip props on inner content: both Ark primitives expose data-state,
// and applying them to the same element would overwrite the selection state.
export function ChampionPositionTabs(props: {
  positions: readonly string[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  includeAll?: boolean;
  compact?: boolean;
  ariaLabel: string;
}) {
  const { t } = useSolidTranslation();
  const options = () =>
    props.includeAll ? ["ALL", ...props.positions] : props.positions;
  const label = (position: string) =>
    t(
      position === "ALL"
        ? "champions.allPositions"
        : `champions.positions.${position}`,
    );
  return (
    <SegmentGroup.Root
      class={s.root({ compact: props.compact ?? false })}
      aria-label={props.ariaLabel}
      value={props.value ?? "ALL"}
      onValueChange={(details) => {
        if (details.value)
          props.onValueChange(details.value === "ALL" ? null : details.value);
      }}
    >
      <For each={options()}>
        {(position) => (
          <SegmentGroup.Item
            class={s.item({ compact: props.compact ?? false })}
            value={position}
          >
            <SegmentGroup.ItemText>
              <AppTooltip content={label(position)} disabled={!props.compact}>
                {(triggerProps) => (
                  <span {...triggerProps<HTMLSpanElement>({ class: s.text })}>
                    <Show when={position !== "ALL"}>
                      <LeaguePositionIcon
                        position={position}
                        width={16}
                        height={16}
                      />
                    </Show>
                    <Show when={!props.compact || position === "ALL"}>
                      <span>{label(position)}</span>
                    </Show>
                  </span>
                )}
              </AppTooltip>
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput
              aria-label={position === "ALL" ? "All positions" : position}
            />
          </SegmentGroup.Item>
        )}
      </For>
    </SegmentGroup.Root>
  );
}
