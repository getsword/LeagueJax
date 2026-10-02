import { style } from "@vanilla-extract/css";

export const root = style({
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
});
export const footer = style({ padding: "0 12px 12px", minWidth: 0 });
