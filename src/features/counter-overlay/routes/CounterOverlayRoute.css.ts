import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css";

export const page = style({
  height: "100%",
  boxSizing: "border-box",
  padding: 10,
});

export const panel = style({
  height: "100%",
  minHeight: 0,
  display: "grid",
  gridTemplateRows: "max-content minmax(0, 1fr)",
  gap: 10,
  padding: 12,
  borderRadius: 16,
  background: theme.color.popupBackground,
  color: theme.color.foreground,
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const header = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) max-content",
  gap: 10,
  alignItems: "center",
});

export const title = style({
  margin: 0,
  fontSize: 16,
  lineHeight: 1.2,
});

export const muted = style({
  color: theme.color.mutedForeground,
  fontSize: 12,
});

export const dismiss = style({
  border: "none",
  borderRadius: 999,
  padding: "4px 10px",
  background: theme.color.background,
  color: theme.color.foreground,
  cursor: "pointer",
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const list = style({
  minHeight: 0,
  overflow: "auto",
  display: "grid",
  alignContent: "start",
  gap: 10,
});

export const status = style({
  margin: 0,
  color: theme.color.mutedForeground,
});
