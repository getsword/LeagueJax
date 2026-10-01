import { style } from "@vanilla-extract/css";
import { theme } from "@/styles/theme.css.ts";

export const page = style({
  height: "100%",
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "320px minmax(0, 1fr)",
  gap: 16,
  padding: 16,
  boxSizing: "border-box",
});

export const panel = style({
  minHeight: 0,
  minWidth: 0,
  display: "grid",
  gridTemplateRows: "max-content minmax(0, 1fr)",
  gap: 12,
  padding: 12,
  borderRadius: 16,
  background: theme.color.surface,
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const listHeader = style({
  display: "grid",
  gap: 8,
});

export const filters = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 6,
  margin: 0,
  padding: 0,
  minWidth: 0,
  border: "none",
});

export const filterLegend = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const filterButton = style({
  width: "100%",
  border: "none",
  borderRadius: 999,
  padding: "6px 0",
  background: theme.color.background,
  color: theme.color.foreground,
  cursor: "pointer",
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const search = style({
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
  background: theme.color.background,
  color: theme.color.foreground,
  font: "inherit",
});

export const list = style({
  minHeight: 0,
});

export const championButton = style({
  width: "100%",
  display: "grid",
  gridTemplateColumns: "40px minmax(0, 1fr) max-content",
  gap: 10,
  alignItems: "center",
  padding: 8,
  border: "none",
  borderRadius: 12,
  background: "transparent",
  color: theme.color.foreground,
  textAlign: "left",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      background: theme.color.tintHover,
    },
  },
});

export const championButtonActive = style({
  background: theme.color.tint,
  outline: `1px solid ${theme.color.primary}`,
  outlineOffset: -1,
});

export const championName = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 600,
});

export const muted = style({
  color: theme.color.mutedForeground,
  fontSize: 12,
});

export const rate = style({
  fontVariantNumeric: "tabular-nums",
  fontWeight: 650,
});

export const portrait = style({
  width: 40,
  height: 40,
  borderRadius: 10,
  objectFit: "cover",
});

export const detail = style({
  minHeight: 0,
  minWidth: 0,
  display: "grid",
  gridTemplateRows: "max-content max-content minmax(0, 1fr)",
  gap: 16,
  padding: 16,
  borderRadius: 16,
  background: theme.color.surface,
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const header = style({
  display: "grid",
  gridTemplateColumns: "64px minmax(0, 1fr)",
  gap: 14,
  alignItems: "center",
});

export const headerPortrait = style({
  width: 64,
  height: 64,
  borderRadius: 14,
  objectFit: "cover",
});

export const titleRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) max-content",
  gap: 12,
  alignItems: "baseline",
});

export const title = style({
  margin: 0,
  fontSize: 24,
  lineHeight: 1.2,
});

export const stats = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, max-content)",
  gap: 16,
  marginTop: 6,
});

export const lanes = style({
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "max-content",
  gap: 8,
});

export const laneButton = style({
  border: "none",
  borderRadius: 999,
  padding: "6px 12px",
  background: theme.color.background,
  color: theme.color.foreground,
  cursor: "pointer",
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const laneButtonActive = style({
  background: theme.color.tint,
  outline: `1px solid ${theme.color.primary}`,
});

export const body = style({
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
  gap: 16,
});

export const stack = style({
  display: "grid",
  alignContent: "start",
  gap: 14,
});

export const sectionTitle = style({
  margin: 0,
  fontSize: 14,
  color: theme.color.mutedForeground,
});

export const skillPriority = style({
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "36px",
  gap: 8,
});

export const skillKey = style({
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  background: theme.color.background,
  fontWeight: 700,
  outline: `1px solid ${theme.color.border}`,
  outlineOffset: -1,
});

export const skillUltimate = style({
  background: theme.color.tint,
  color: theme.color.primary,
});

export const skillOrder = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 28px)",
  gap: 6,
});

export const skillStep = style({
  display: "grid",
  placeItems: "center",
  height: 28,
  borderRadius: 8,
  background: theme.color.background,
  fontSize: 12,
  fontWeight: 650,
});

export const buildRow = style({
  display: "grid",
  gridTemplateColumns: "72px minmax(0, 1fr) max-content",
  gap: 10,
  alignItems: "center",
});

export const icons = style({
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "32px",
  gap: 6,
  justifyContent: "start",
});

export const icon = style({
  width: 32,
  height: 32,
  borderRadius: 8,
  objectFit: "cover",
  background: theme.color.background,
});

export const matchups = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  minHeight: 0,
});

export const matchupCard = style({
  minWidth: 0,
  display: "grid",
  alignContent: "start",
  gap: 8,
});

export const matchupRow = style({
  display: "grid",
  gridTemplateColumns: "28px minmax(0, 1fr) max-content",
  gap: 8,
  alignItems: "center",
});

export const smallPortrait = style({
  width: 28,
  height: 28,
  borderRadius: 8,
  objectFit: "cover",
});

export const status = style({
  padding: 24,
  color: theme.color.mutedForeground,
});

export const win = style({
  color: theme.color.success,
});

export const loss = style({
  color: theme.color.error,
});
