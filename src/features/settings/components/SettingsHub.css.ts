import { style } from "@vanilla-extract/css";
import * as tabStrip from "@/components/tab-strip/TabStrip.css";
import { theme } from "@/styles/theme.css";

export const page = style({
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: 16,
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  padding: "12px",
  paddingTop: 4,
});

export const outlet = style({
  display: "grid",
  minHeight: 0,
  height: "100%",
});

export const outletContent = style({
  display: "grid",
  minHeight: "100%",
});

export const outletRouteLayer = style({
  display: "grid",
  width: "100%",
  minWidth: 0,
  minHeight: "100%",
});

export const title = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: theme.color.foreground,
});

export const sections = style({
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  "@media": {
    "(max-width: 1200px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const pageTabs = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) max-content",
  alignItems: "center",
  // gap: 12,
  minWidth: 0,
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
      alignItems: "start",
      gap: 6,
    },
  },
});

export const primaryTabsRoot = style({
  display: "grid",
  minWidth: 0,
});

export const primaryTabsList = style([
  tabStrip.list,
  { overflowX: "auto", overflowY: "hidden" },
]);

export const primaryTab = tabStrip.item;

export const utilityTabsRoot = style({
  display: "grid",
  minWidth: 0,
  justifySelf: "end",
  "@media": {
    "(max-width: 900px)": {
      width: "100%",
      justifySelf: "stretch",
    },
  },
});

export const utilityTabsList = style([
  primaryTabsList,
  {
    maxWidth: "100%",
    "@media": {
      "(max-width: 900px)": {
        justifyContent: "end",
      },
    },
  },
]);
