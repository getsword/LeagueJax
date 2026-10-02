import { style } from "@vanilla-extract/css";
import * as tabStrip from "@/components/tab-strip/TabStrip.css";

export const page = style({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gap: 16,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  padding: "12px",
  paddingTop: 4,
});

export const segmentRoot = style([
  tabStrip.list,
  { overflowX: "auto", overflowY: "hidden" },
]);

export const segmentItem = tabStrip.item;

export const content = style({
  display: "grid",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
});
