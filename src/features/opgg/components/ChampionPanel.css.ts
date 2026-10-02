import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { scrollAreaOutsetWidth } from "@/components/scroll-area/ScrollArea.css";
import { theme } from "@/styles/theme.css";

export const frame = recipe({
  base: {
    display: "grid",
    minWidth: 0,
    minHeight: 0,
    vars: { [scrollAreaOutsetWidth]: "12px" },
  },
  variants: {
    flowing: {
      true: { gridTemplateRows: "auto", alignContent: "start" },
      false: { gridTemplateRows: "minmax(0, 1fr)", height: "100%" },
    },
  },
});
export const card = recipe({
  // The card's trailing padding reserves the shared 12px track plus 2px of
  // clearance, keeping configuration and table scrollbars on the same axis.
  base: { minWidth: 0, minHeight: 0, paddingInlineEnd: 14 },
  variants: {
    bounded: {
      true: {
        gridTemplateRows: "minmax(0, 1fr)",
        alignContent: "stretch",
        height: "100%",
      },
      false: { gridTemplateRows: "auto", alignContent: "start" },
    },
  },
});
export const body = recipe({
  base: { minWidth: 0, minHeight: 0 },
  variants: {
    bounded: {
      true: { gridTemplateRows: "minmax(0, 1fr)" },
      false: { gridTemplateRows: "auto" },
    },
  },
});
export const region = recipe({
  base: { display: "grid", minWidth: 0, minHeight: 0, gap: 8 },
  variants: {
    titled: { true: {}, false: {} },
    bounded: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      variants: { titled: true, bounded: true },
      style: { gridTemplateRows: "auto minmax(0, 1fr)" },
    },
    {
      variants: { titled: false, bounded: true },
      style: { gridTemplateRows: "minmax(0, 1fr)" },
    },
    {
      variants: { titled: true, bounded: false },
      style: { gridTemplateRows: "auto auto" },
    },
    {
      variants: { titled: false, bounded: false },
      style: { gridTemplateRows: "auto" },
    },
  ],
});
export const title = style({
  margin: 0,
  fontSize: "0.8125rem",
  fontWeight: 500,
});
export const scroller = style({
  gridTemplateRows: "minmax(0, 1fr)",
  minWidth: 0,
  minHeight: 0,
});
export const scrollContent = style({
  display: "grid",
  alignContent: "start",
  minWidth: 0,
});
export const viewport = recipe({
  base: {
    overscrollBehaviorY: "contain",
    selectors: {
      "&:focus-visible": {
        outline: `1px solid ${theme.color.primary}`,
        outlineOffset: -1,
      },
    },
  },
  variants: {
    flowing: {
      true: { height: "auto" },
      false: { height: "100%" },
    },
  },
});
