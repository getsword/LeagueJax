import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css";

export const panel = style({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gap: 10,
  minWidth: 0,
  minHeight: 0,
  paddingRight: 12,
});
export const header = style({ display: "grid", gap: 10, minWidth: 0 });
export const titleRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "baseline",
  gap: 8,
  minHeight: 28,
});
export const title = style({
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 600,
});
export const search = style({
  minWidth: 0,
  selectors: { "&:focus-visible": { outlineOffset: -2 } },
});
export const scroller = style({ minHeight: 0 });
export const content = style({ minHeight: "100%", display: "grid" });
export const list = style({ display: "grid", alignContent: "start", gap: 2 });
export const row = style({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  minHeight: 48,
  padding: "8px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "0.8125rem",
  transition: "background 120ms ease-out",
  selectors: {
    "&:hover": { background: theme.color.surface },
    '&[data-state="checked"]': { background: theme.color.tint },
    '&[data-state="checked"]::before': {
      content: '""',
      position: "absolute",
      left: 0,
      top: 12,
      bottom: 12,
      width: 2,
      background: theme.color.primary,
    },
  },
});
export const portrait = style({ width: 32, height: 32, borderRadius: 6 });
export const name = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 500,
});
export const skeletonRow = style({
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr) 42px",
  alignItems: "center",
  gap: 8,
  minHeight: 48,
  padding: 8,
});
export const skeletonText = style({ height: 10 });
