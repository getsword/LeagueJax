/** @jsxImportSource solid-js */
import { Key } from "@solid-primitives/keyed";
import { invoke } from "@tauri-apps/api/core";
import { Show } from "solid-js";
import { useChampionAssets } from "@/features/champions/assets";
import { useSolidTranslation } from "@/i18n/solid";
import { CounterPickSection } from "../components/CounterPickSection";
import { useEnemyPicks } from "../hooks/use-enemy-picks";
import * as s from "./CounterOverlayRoute.css.ts";

export function CounterOverlayRoute() {
  const { t } = useSolidTranslation();
  const assets = useChampionAssets();
  const picks = useEnemyPicks();
  const nameOf = (championId: number) =>
    assets().names[championId] ?? `#${championId}`;

  return (
    <div class={s.page}>
      <section class={s.panel}>
        <div class={s.header} data-tauri-drag-region>
          <div data-tauri-drag-region>
            <h1 class={s.title} data-tauri-drag-region>
              {t("counterOverlay.title")}
            </h1>
            <p class={s.muted} data-tauri-drag-region>
              {t("counterOverlay.source")}
            </p>
          </div>
          <button
            type="button"
            class={s.dismiss}
            aria-label="Dismiss counter overlay"
            onClick={() => {
              void invoke("counter_overlay_dismiss");
            }}
          >
            {t("counterOverlay.dismiss")}
          </button>
        </div>
        <div class={s.list}>
          <Show
            when={picks().length > 0}
            fallback={<p class={s.status}>{t("counterOverlay.waiting")}</p>}
          >
            <Key each={picks()} by={(pick) => pick.cellId}>
              {(pick) => <CounterPickSection pick={pick()} nameOf={nameOf} />}
            </Key>
          </Show>
        </div>
      </section>
    </div>
  );
}
