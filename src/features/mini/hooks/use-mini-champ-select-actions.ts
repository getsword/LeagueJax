import { invoke } from "@tauri-apps/api/core";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  on,
} from "solid-js";
import { useSolidTranslation } from "@/i18n/solid";
import { createLogger } from "@/infra/logger";
import type { MiniWindowModel } from "./use-mini-window-model";

const logger = createLogger("mini-champ-select");

// Game action state survives hiding its page. A session change invalidates
// completions so an old dodge/swap cannot write an error into the next lobby.
export function useMiniChampSelectActions(model: Accessor<MiniWindowModel>) {
  const { t } = useSolidTranslation();
  const [pendingChampionId, setPendingChampionId] = createSignal<number | null>(
    null,
  );
  const [dodgePending, setDodgePending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const sessionId = createMemo(() =>
    model().phase === "ChampSelect"
      ? (model().champSelect?.session.gameId ?? null)
      : null,
  );
  let revision = 0;
  createEffect(
    on(sessionId, () => {
      revision += 1;
      setPendingChampionId(null);
      setDodgePending(false);
      setError(null);
    }),
  );

  const swap = async (championId: number) => {
    if (sessionId() === null || pendingChampionId() !== null || dodgePending())
      return;
    const requestRevision = revision;
    setError(null);
    setPendingChampionId(championId);
    try {
      await invoke("lcu_champ_select_swap_bench_champion", { championId });
      await invoke("ongoing_game_refresh");
    } catch (caughtError) {
      logger.error(
        { error: caughtError, championId },
        "Failed to swap bench champion",
      );
      if (requestRevision === revision)
        setError(t("mini.champSelect.swapFailed"));
    } finally {
      if (requestRevision === revision) setPendingChampionId(null);
    }
  };

  const dodge = async () => {
    if (sessionId() === null || dodgePending()) return;
    const requestRevision = revision;
    setError(null);
    setDodgePending(true);
    try {
      await invoke("lcu_dodge_champ_select");
      await invoke("ongoing_game_refresh");
    } catch (caughtError) {
      logger.error({ error: caughtError }, "Failed to dodge champion select");
      if (requestRevision === revision)
        setError(t("mini.champSelect.dodge.failed"));
    } finally {
      if (requestRevision === revision) setDodgePending(false);
    }
  };

  return { pendingChampionId, dodgePending, error, swap, dodge };
}

export type MiniChampSelectActions = ReturnType<
  typeof useMiniChampSelectActions
>;
