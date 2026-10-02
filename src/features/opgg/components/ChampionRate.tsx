/** @jsxImportSource solid-js */
import { formatRate } from "../model";
import * as s from "./ChampionPresentation.css";

export function ChampionRate(props: {
  value: number | undefined;
  neutral?: boolean;
}) {
  return (
    <span
      class={s.rate({
        tone:
          props.neutral || props.value === undefined
            ? "neutral"
            : props.value >= 0.5
              ? "positive"
              : "negative",
      })}
    >
      {props.value === undefined ? "—" : formatRate(props.value)}
    </span>
  );
}
