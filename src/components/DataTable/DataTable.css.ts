import { createVar, fallbackVar, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { theme } from "@/styles/theme.css";

export const tableWrap = recipe({
  base: {
    minWidth: 0,
    minHeight: 0,
    outline: `1px solid ${theme.color.border}`,
    outlineOffset: -1,
    borderRadius: 10,
    overflow: "hidden",
  },
  variants: {
    stickyHeader: {
      enabled: {
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
        height: "100%",
      },
      disabled: {},
    },
    scrollbarMode: {
      inline: {},
      outset: {},
    },
  },
  compoundVariants: [
    {
      variants: { stickyHeader: "enabled", scrollbarMode: "outset" },
      style: { overflow: "visible" },
    },
  ],
  defaultVariants: {
    stickyHeader: "disabled",
    scrollbarMode: "inline",
  },
});

export const columnWidth = createVar();
export const column = style({ width: fallbackVar(columnWidth, "auto") });
export const bodyScrollbarSize = "8px";
export const header = recipe({
  base: {
    minWidth: 0,
    overflow: "hidden",
    borderRadius: "10px 10px 0 0",
    background: theme.color.surface,
    boxShadow: `inset 0 -1px ${theme.color.border}`,
  },
  variants: {
    scrollbarMode: {
      inline: { paddingInlineEnd: bodyScrollbarSize },
      outset: { paddingInlineEnd: 0 },
    },
  },
  defaultVariants: { scrollbarMode: "inline" },
});
export const bodyScroller = style({
  gridTemplateRows: "minmax(0, 1fr)",
  minWidth: 0,
  minHeight: 0,
});
export const bodyViewport = style({
  borderRadius: "0 0 10px 10px",
  overscrollBehaviorY: "contain",
  selectors: {
    "&:focus-visible": {
      outline: `1px solid ${theme.color.primary}`,
      outlineOffset: -1,
    },
  },
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
});

export const headCell = style({
  fontSize: "0.75rem",
  color: theme.color.mutedForeground,
  padding: "9px 12px",
  background: theme.color.surface,
  borderBottom: `1px solid ${theme.color.border}`,
  textAlign: "left",
  verticalAlign: "top",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const bodyCell = style({
  fontSize: "0.8125rem",
  color: theme.color.foreground,
  padding: "10px 12px",
  borderBottom: `1px solid ${theme.color.border}`,
  verticalAlign: "top",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const empty = style({
  padding: "16px 12px",
  color: theme.color.mutedForeground,
  fontSize: "0.8125rem",
});

export const monospace = style({
  fontFamily:
    'ui-monospace, "SFMono-Regular", "Cascadia Code", "Fira Code", Consolas, "Liberation Mono", Menlo, monospace',
});

export const mutedCell = style({
  color: theme.color.mutedForeground,
  textWrap: "nowrap",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});
