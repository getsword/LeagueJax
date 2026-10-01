/** @jsxImportSource solid-js */
import { Swords } from "lucide-solid";
import { lazy } from "solid-js";
import type { Jax } from "@/jax";
import type { SolidWebShard } from "@/runtime/solid-web-contract";
import { SHARD_IDS } from "../shard-ids";
import { championsI18n } from "./i18n";

const ChampionsRoute = lazy(() => import("./routes/ChampionsRoute"));

export class SolidChampionsShard implements SolidWebShard {
  public label() {
    return "SolidChampionsShard";
  }

  public id() {
    return SHARD_IDS.CHAMPIONS;
  }

  public dependsOn() {
    return [SHARD_IDS.I18N];
  }

  public setup(_jax: Jax): void {}

  public routes() {
    return [
      {
        path: "champions",
        component: ChampionsRoute,
        order: 20,
      },
    ];
  }

  public navItems() {
    return [
      {
        to: "/main/champions",
        labelKey: "nav.champions",
        icon: Swords,
        section: "main" as const,
        order: 20,
      },
    ];
  }

  public i18nResources() {
    return championsI18n;
  }
}
