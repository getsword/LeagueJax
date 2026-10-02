/** @jsxImportSource solid-js */
import { createMemo } from "solid-js";
import { createListCollection, SettingsSelect } from "@/components/settings-ui";
import { useSolidTranslation } from "@/i18n/solid";
import { CHAMPION_POSITIONS } from "../../model";
import { type CounterPositionChoice, isCounterPosition } from "../model";

export function CounterPositionSelect(props: {
  cellId: number;
  value: CounterPositionChoice;
  resolvedPosition: string | null;
  onValueChange: (value: CounterPositionChoice) => void;
}) {
  const { t } = useSolidTranslation();
  const collection = createMemo(() =>
    createListCollection({
      items: [
        { value: "auto", label: t("counters.auto") },
        ...CHAMPION_POSITIONS.map((value) => ({
          value: String(value),
          label: t(`counters.positions.${value}`),
        })),
      ],
    }),
  );
  return (
    <SettingsSelect
      ariaLabel={`Select counter position for enemy slot ${props.cellId}`}
      size="sm"
      fit="content"
      collection={collection()}
      value={[props.value]}
      formatValue={(label) =>
        props.value === "auto" && props.resolvedPosition
          ? t("counters.autoPosition", {
              position: t(`counters.positions.${props.resolvedPosition}`),
            })
          : label
      }
      positioning={{ sameWidth: false }}
      onValueChange={({ value }) => {
        const next = value[0];
        if (next === "auto" || (next && isCounterPosition(next)))
          props.onValueChange(next);
      }}
    />
  );
}
