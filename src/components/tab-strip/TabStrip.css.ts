import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css";

export const list = style({
  position: "relative",
  display: "flex",
  gap: 2,
  alignItems: "end",
  minWidth: 0,
  minHeight: 34,
  borderBottom: `1px solid ${theme.color.border}`,
});

export const item = style({
  position: "relative",
  display: "grid",
  flex: "0 0 auto",
  placeItems: "center",
  minWidth: 0,
  minHeight: 32,
  border: "none",
  borderRadius: "6px 6px 0 0",
  padding: "0 12px",
  color: theme.color.mutedForeground,
  textDecoration: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "0.875rem",
  lineHeight: 1,
  whiteSpace: "nowrap",
  transition: "background 120ms ease-out",
  selectors: {
    "&:hover": {
      color: theme.color.foreground,
      background: theme.color.surface,
    },
    '&:is([data-selected], [data-state="checked"], [data-checked])': {
      color: theme.color.foreground,
    },
    '&:is([data-selected], [data-state="checked"], [data-checked])::after': {
      content: '""',
      position: "absolute",
      insetInline: 1,
      bottom: -1,
      height: 2,
      borderRadius: 999,
      background: theme.color.primary,
    },
    // Tabs focus the trigger itself; radio-backed segments focus a hidden input.
    // Both show the same keyboard focus ring without retaining one after a pointer click.
    "&:focus-visible, &:has(input:focus-visible)": {
      outline: `1px solid ${theme.color.primary}`,
      outlineOffset: -1,
    },
  },
});
