/** @jsxImportSource solid-js */
import { Swords } from "lucide-solid";
import { Show } from "solid-js";
import type {
  MiniTabDefinition,
  MiniTabPageProps,
} from "@/features/mini/tabs/types";
import { useSolidOngoingGameStore } from "@/features/ongoing-game/store";
import { CounterPanel } from "./components/CounterPanel";

// Tab switches preserve a panel, but changing the champion-select session must
// reset its scroll and expansion state instead of reusing the previous lobby.
function MiniCountersPage(props: MiniTabPageProps) {
  const session = useSolidOngoingGameStore((state) => state.champSelectSession);
  const phase = useSolidOngoingGameStore((state) => state.phase);
  const picks = useSolidOngoingGameStore((state) => state.enemyChampionPicks);
  const sessionKey = () =>
    phase() === "ChampSelect" && session() ? String(session()?.gameId) : null;
  return (
    <Show when={sessionKey()} keyed>
      <CounterPanel picks={picks()} active={props.active} />
    </Show>
  );
}

// The OP.GG adapter owns phase-specific availability. Mini's tab host only
// handles opaque IDs, availability and components, without game rules.
export function createCountersMiniTab(): MiniTabDefinition {
  const enabled = useSolidOngoingGameStore(
    (state) =>
      state.phase === "ChampSelect" &&
      state.champSelectSession !== null &&
      !state.champSelectSession.isSpectating,
  );
  return {
    id: "opgg-counters",
    titleKey: "counters.title",
    ariaLabel: "Champion counters",
    icon: Swords,
    order: 20,
    availability: () => {
      const available = enabled();
      return {
        enabled: available,
        reasonKey: available ? undefined : "counters.unavailable",
      };
    },
    component: MiniCountersPage,
  };
}
