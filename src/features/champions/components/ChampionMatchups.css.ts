import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css";

export const champion = style({
  display: "grid",
  gridTemplateColumns: "24px minmax(0, 1fr)",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
});
export const portrait = style({
  width: 24,
  height: 24,
  borderRadius: 4,
  background: theme.color.surface,
});
export const name = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
export const numericCell = style({
  fontVariantNumeric: "tabular-nums",
});
