import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { createSignal, onCleanup, onMount } from "solid-js";
import type {
  EnemyChampionPick,
  OngoingGameUpdated,
} from "@/bindings/ongoing_game";
import { nextEnemyPicks } from "../model";

export function useEnemyPicks() {
  const [picks, setPicks] = createSignal<EnemyChampionPick[]>([]);

  onMount(() => {
    let disposed = false;
    let eventSeen = false;
    const apply = (
      incoming: EnemyChampionPick[],
      source: "snapshot" | "event",
    ) => {
      setPicks((current) => {
        const next = nextEnemyPicks({
          current,
          incoming,
          source,
          eventSeen,
        });
        eventSeen = next.eventSeen;
        return next.picks;
      });
    };

    void invoke<OngoingGameUpdated>("ongoing_game_get_snapshot")
      .then((snapshot) => {
        if (!disposed) {
          apply(snapshot.enemy_champion_picks ?? [], "snapshot");
        }
      })
      .catch(() => undefined);

    const unlisten = listen<OngoingGameUpdated>(
      "ongoing-game-updated",
      (event) => {
        apply(event.payload.enemy_champion_picks ?? [], "event");
      },
    );

    onCleanup(() => {
      disposed = true;
      void unlisten.then((stop) => stop());
    });
  });

  return picks;
}
