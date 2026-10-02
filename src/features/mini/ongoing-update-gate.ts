import type { OngoingGameUpdated } from "@/bindings/ongoing_game";

// Subscribe before taking the snapshot, and mark live updates before batching
// them. A late snapshot must not roll back either the phase or enemy picks.
export function createMiniOngoingUpdateGate(
  apply: (payload: OngoingGameUpdated) => void,
) {
  let eventSeen = false;
  let disposed = false;
  return {
    receive(payload: OngoingGameUpdated, source: "snapshot" | "event") {
      if (disposed || (source === "snapshot" && eventSeen)) return;
      if (source === "event") eventSeen = true;
      apply(payload);
    },
    dispose() {
      disposed = true;
    },
  };
}
