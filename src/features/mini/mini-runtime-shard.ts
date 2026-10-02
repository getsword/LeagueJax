import type { SolidWebShard } from "@/runtime/solid-web-contract";
import { collectI18nResources } from "../i18n/resources";
import { countersI18n } from "../opgg/counters/i18n";
import { SHARD_IDS } from "../shard-ids";
import { miniI18n } from "./i18n";

export class MiniRuntimeShard implements SolidWebShard {
  public label() {
    return "MiniRuntimeShard";
  }

  public id() {
    return SHARD_IDS.MINI;
  }

  public i18nResources() {
    return collectI18nResources([
      { i18nResources: () => miniI18n },
      { i18nResources: () => countersI18n },
    ]);
  }
}
