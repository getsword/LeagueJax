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
export const cell = style({
  padding: "8px 4px",
  fontSize: "0.8125rem",
  lineHeight: 1.5,
  verticalAlign: "middle",
});
export const numericCell = style([
  cell,
  {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
    fontSize: "0.75rem",
  },
]);
