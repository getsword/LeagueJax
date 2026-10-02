/** @jsxImportSource solid-js */
import { invoke } from "@tauri-apps/api/core";
import { onMount } from "solid-js";
import { MiniTabPanels, MiniTabsProvider } from "@/features/mini/tabs/MiniTabs";
import {
  createMiniTabDefinitions,
  DEFAULT_MINI_TAB_ID,
} from "@/features/mini/tabs/registry";
import { MiniWindowShell } from "@/layout/__mini-shell";

function useNotifyMiniReady() {
  onMount(() => {
    void invoke("mini_window_ready");
  });
}

export default function MiniApp() {
  useNotifyMiniReady();
  const tabs = createMiniTabDefinitions();

  return (
    <MiniTabsProvider tabs={tabs} defaultId={DEFAULT_MINI_TAB_ID}>
      <MiniWindowShell>
        <MiniTabPanels />
      </MiniWindowShell>
    </MiniTabsProvider>
  );
}
