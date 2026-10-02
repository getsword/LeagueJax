import { style } from "@vanilla-extract/css";

export const page = style({
  display: "grid",
  gridTemplateColumns: "clamp(208px, 24%, 272px) minmax(0, 1fr)",
  gap: 8,
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
  padding: "4px 12px 12px",
});
