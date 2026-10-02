import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css.ts";

export const header = style({
  display: "grid",
  gridTemplateColumns: "auto minmax(40px, 1fr) auto",
  height: 36,
  background: "transparent",
  borderBottom: `1px solid ${theme.color.border}`,
  userSelect: "none",
});

export const dragZone = style({
  minWidth: 0,
  height: "100%",
});

export const controls = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
});

export const windowButton = style({
  selectors: {
    '&[aria-pressed="true"]': {
      background: `oklch(from ${theme.color.primary} l c h / 0.14)`,
      color: theme.color.primary,
    },
    '&[aria-pressed="true"]:hover': {
      background: `oklch(from ${theme.color.primary} l c h / 0.22)`,
      color: theme.color.primary,
    },
    ':root[data-mini-hover-suspended="true"] &:hover': {
      background: "transparent",
      color: `oklch(from ${theme.color.foreground} l c h / 0.7)`,
    },
    ':root[data-mini-hover-suspended="true"] &[aria-pressed="true"]': {
      background: `oklch(from ${theme.color.primary} l c h / 0.14)`,
      color: theme.color.primary,
    },
  },
});
