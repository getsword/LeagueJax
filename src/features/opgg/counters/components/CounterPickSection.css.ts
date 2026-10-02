import { style, styleVariants } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css";

export const section = style({
  display: "grid",
  gap: 8,
  padding: 8,
  borderRadius: 12,
  background: theme.color.background,
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const enemy = style({
  display: "grid",
  gridTemplateColumns: "36px minmax(0, 1fr) max-content",
  gap: 8,
  alignItems: "center",
});

export const portrait = style({
  width: 36,
  height: 36,
  borderRadius: 10,
  objectFit: "cover",
});

export const enemyName = style({
  margin: 0,
  fontSize: 15,
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
export const enemyInfo = style({ display: "grid", gap: 4, minWidth: 0 });
export const metadata = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 6,
  minWidth: 0,
});

export const muted = style({
  margin: 0,
  color: theme.color.mutedForeground,
  fontSize: 12,
});

export const toggle = style({
  display: "grid",
  placeItems: "center",
  width: 26,
  height: 26,
  border: "none",
  borderRadius: 999,
  padding: 0,
  background: theme.color.popupBackground,
  color: theme.color.foreground,
  cursor: "pointer",
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const row = style({
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr) max-content",
  gap: 8,
  alignItems: "center",
});

export const smallPortrait = style({
  width: 32,
  height: 32,
  borderRadius: 8,
  objectFit: "cover",
});

export const name = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 600,
});

export const rate = style({
  fontVariantNumeric: "tabular-nums",
  fontWeight: 650,
});

export const rateTone = styleVariants({
  win: { color: theme.color.success },
  loss: { color: theme.color.error },
});

export const status = style({
  margin: 0,
  minHeight: 112,
  display: "grid",
  justifyItems: "start",
  alignContent: "center",
  gap: 8,
  fontSize: "0.75rem",
  color: theme.color.mutedForeground,
});

export const body = style({
  display: "grid",
  gap: 8,
  selectors: { "&[hidden]": { display: "none" } },
});

export const retry = style({
  padding: "4px 8px",
  borderRadius: 4,
  background: theme.color.surface,
  color: theme.color.foreground,
  selectors: {
    "&:focus-visible": {
      outline: `1px solid ${theme.color.primary}`,
      outlineOffset: -1,
    },
  },
});
