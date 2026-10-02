/** @jsxImportSource solid-js */
import { Show } from "solid-js";
import { useMiniChampSelectActions } from "../hooks/use-mini-champ-select-actions";
import { useSolidMiniWindowModel } from "../hooks/use-mini-window-model";
import { MiniRoute } from "../routes/MiniRoute";
import type { MiniTabPageProps } from "../tabs/types";
import { MiniBottomPanel, resolveMiniBottomPanelKind } from "./MiniBottomPanel";
import * as s from "./MiniGamePage.css";

// Game actions belong to the game page, including their pending state. The tab
// host keeps this page mounted while hiding its entire content on other tabs.
export function MiniGamePage(props: MiniTabPageProps) {
  const model = useSolidMiniWindowModel();
  const actions = useMiniChampSelectActions(model);
  return (
    <section class={s.root}>
      <MiniRoute model={model()} actions={actions} active={props.active} />
      <Show when={resolveMiniBottomPanelKind(model().phase) !== "none"}>
        <footer class={s.footer}>
          <MiniBottomPanel
            model={model()}
            champSelectDodge={
              model().champSelect
                ? {
                    pending: actions.dodgePending(),
                    error: actions.error(),
                    onDodge: actions.dodge,
                  }
                : undefined
            }
          />
        </footer>
      </Show>
    </section>
  );
}
