import { style } from "@vanilla-extract/css";
import { layers } from "@/styles/layers.css";
import { theme } from "@/styles/theme.css";

export const root = style({ height: "100%", minWidth: 0, minHeight: 0 });
export const navigation = style({
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  paddingInline: 4,
  gap: 2,
});
export const list = style({
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  gap: 2,
});
export const trigger = style({
  display: "grid",
  placeItems: "center",
  width: 30,
  height: 28,
  padding: 0,
  borderRadius: 5,
  color: theme.color.mutedForeground,
  background: "transparent",
  transition: "color 100ms, background-color 100ms",
  selectors: {
    '&:hover:not([aria-disabled="true"])': {
      background: theme.color.surface,
      color: theme.color.foreground,
    },
    '&[data-selected], &[data-selected]:hover, &[aria-pressed="true"], &[aria-pressed="true"]:hover':
      {
        background: theme.color.tint,
        color: theme.color.primary,
      },
    '&[aria-disabled="true"]': { opacity: 0.45, cursor: "default" },
    "&:focus-visible": {
      outline: `2px solid ${theme.color.primary}`,
      outlineOffset: -2,
    },
  },
});
export const triggerWrapper = style({ display: "grid", alignItems: "center" });
export const panels = style({ minWidth: 0, minHeight: 0, height: "100%" });
export const accessibleLabel = style({
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
});
export const panel = style({
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
  selectors: { "&[hidden]": { display: "none" } },
});
export const menuPositioner = style({ zIndex: layers.overlay.popover });
export const menu = style({
  display: "grid",
  minWidth: 160,
  maxWidth: "calc(100vw - 24px)",
  padding: 4,
  borderRadius: 8,
  background: theme.color.popupBackground,
  color: theme.color.foreground,
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
  selectors: { "&[hidden]": { display: "none" } },
});
export const menuItem = style({
  display: "grid",
  gridTemplateColumns: "16px minmax(0, 1fr) 16px",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderRadius: 4,
  fontSize: "0.8125rem",
  selectors: {
    "&[data-highlighted]": { background: theme.color.surface },
    "&[data-disabled]": { opacity: 0.45 },
  },
});
export const menuLabel = style({ display: "grid", gap: 3 });
export const reason = style({
  fontSize: "0.75rem",
  color: theme.color.mutedForeground,
});
