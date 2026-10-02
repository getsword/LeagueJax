import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css";

export const root = style({
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gap: 12,
  padding: 12,
});
export const heading = style({ display: "grid", gap: 4, fontSize: "0.875rem" });
export const toolbar = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 8,
});
export const actions = style({
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  gap: 4,
});
export const source = style({
  fontSize: "0.75rem",
  color: theme.color.mutedForeground,
});
export const scroll = style({ minWidth: 0, minHeight: 0 });
export const list = style({ display: "grid", alignContent: "start", gap: 10 });
export const status = style({
  margin: 0,
  minHeight: 140,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: theme.color.mutedForeground,
  fontSize: "0.8125rem",
});
