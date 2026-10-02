/** @jsxImportSource solid-js */
import { Gamepad2 } from "lucide-solid";
import { createCountersMiniTab } from "@/features/opgg/counters/mini-tab";
import { MiniGamePage } from "../components/MiniGamePage";
import type { MiniTabDefinition } from "./types";

export const DEFAULT_MINI_TAB_ID = "game";

// This composition boundary is the only place that knows the installed mini
// pages. The title bar and selection controller consume generic definitions.
export function createMiniTabDefinitions(): MiniTabDefinition[] {
  return [
    {
      id: DEFAULT_MINI_TAB_ID,
      titleKey: "mini.tabs.game",
      ariaLabel: "Game",
      icon: Gamepad2,
      order: 10,
      component: MiniGamePage,
    },
    createCountersMiniTab(),
  ];
}
