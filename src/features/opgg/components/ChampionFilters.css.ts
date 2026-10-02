import { style } from "@vanilla-extract/css";

export const filters = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  minWidth: 0,
});
