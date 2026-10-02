import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { OngoingGameUpdated } from "@/bindings/ongoing_game";
import { createLogger } from "@/infra/logger";
import type { Jax } from "@/jax";
import type { SolidWebShard } from "@/runtime/solid-web-contract";
import { ongoingGameI18n } from "../ongoing-game/i18n";
import { ongoingGameStore } from "../ongoing-game/store-core";
import { SHARD_IDS } from "../shard-ids";
import { createMiniOngoingUpdateGate } from "./ongoing-update-gate";

const logger = createLogger("mini-ongoing-game");

export class MiniOngoingGameShard implements SolidWebShard {
  private ongoingUpdatedUnlisten: UnlistenFn | null = null;
  private pendingUpdated: OngoingGameUpdated | null = null;
  private updateRafId: number | null = null;
  private updateGate: ReturnType<typeof createMiniOngoingUpdateGate> | null =
    null;

  public label() {
    return "MiniOngoingGameShard";
  }

  public id() {
    return SHARD_IDS.ONGOING_GAME;
  }

  public dependsOn() {
    return [SHARD_IDS.SETTINGS];
  }

  public async setup(_jax: Jax): Promise<void> {
    const gate = createMiniOngoingUpdateGate((payload) => {
      this.pendingUpdated = payload;
      if (this.updateRafId != null) {
        return;
      }

      this.updateRafId = requestAnimationFrame(() => {
        this.updateRafId = null;
        const pending = this.pendingUpdated;
        if (pending) {
          this.pendingUpdated = null;
          ongoingGameStore.getState().applyUpdated(pending);
        }
      });
    });
    this.updateGate = gate;
    const unlisten = await listen<OngoingGameUpdated>(
      "ongoing-game-updated",
      (event) => gate.receive(event.payload, "event"),
    );
    if (this.updateGate !== gate) {
      unlisten();
      return;
    }
    this.ongoingUpdatedUnlisten = unlisten;

    try {
      const snapshot = await invoke<OngoingGameUpdated>(
        "ongoing_game_get_snapshot",
      );
      gate.receive(snapshot, "snapshot");
    } catch (error) {
      logger.warn({ error }, "Failed to load initial mini game snapshot");
    }

    if (this.updateGate === gate) {
      void invoke("ongoing_game_refresh").catch((error) => {
        logger.warn({ error }, "Failed to refresh mini game state");
      });
    }
  }

  public teardown(_jax: Jax): void {
    this.updateGate?.dispose();
    this.updateGate = null;
    if (this.updateRafId != null) {
      cancelAnimationFrame(this.updateRafId);
      this.updateRafId = null;
      this.pendingUpdated = null;
    }
    if (this.ongoingUpdatedUnlisten) {
      this.ongoingUpdatedUnlisten();
      this.ongoingUpdatedUnlisten = null;
    }
    ongoingGameStore.getState().reset();
  }

  public i18nResources() {
    return ongoingGameI18n;
  }
}
