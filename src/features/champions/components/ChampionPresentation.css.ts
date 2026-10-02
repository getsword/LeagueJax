import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { theme } from "@/styles/theme.css";

export const rate = recipe({
  base: {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  variants: {
    tone: {
      positive: { color: theme.color.success },
      negative: { color: theme.color.error },
      neutral: { color: theme.color.foreground },
    },
  },
});
export const muted = style({
  color: theme.color.mutedForeground,
  fontSize: "0.75rem",
  lineHeight: 1.5,
});
export const skeleton = style({
  borderRadius: 4,
  background: theme.color.surface,
});
export const sectionLabel = style({
  margin: 0,
  color: theme.color.mutedForeground,
  fontSize: "0.75rem",
  fontWeight: 500,
});
export const stack = style({
  display: "grid",
  gap: 12,
  minWidth: 0,
  alignContent: "start",
});
