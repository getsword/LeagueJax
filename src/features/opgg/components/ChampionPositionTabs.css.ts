import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import * as tabStrip from "@/components/tab-strip/TabStrip.css";

export const root = recipe({
  base: [tabStrip.list, { flexWrap: "wrap" }],
  variants: {
    compact: {
      true: {
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      },
      false: {},
    },
  },
});
export const item = recipe({
  base: tabStrip.item,
  variants: {
    compact: { true: { paddingInline: 2, fontSize: "0.6875rem" }, false: {} },
  },
});
export const text = style({
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  gap: 6,
  whiteSpace: "nowrap",
});
