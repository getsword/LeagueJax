import { createMemo } from "solid-js";
import { createSolidQuery } from "@/infra/solid-query";

const CDRAGON_GAME_DATA_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default";
const CDRAGON_ZH_CN_SUMMARY = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/zh_cn/v1/champion-summary.json`;

type ChampionSummaryEntry = {
  id?: number | string;
  name?: string;
};

type ItemEntry = {
  id?: number | string;
  iconPath?: string;
};

type SpellEntry = {
  id?: number | string;
  name?: string;
  iconPath?: string;
};

export type ChampionAssets = {
  names: Record<number, string>;
  itemIcons: Record<number, string>;
  spellIcons: Record<number, string>;
  spellNames: Record<number, string>;
};

const EMPTY_ASSETS: ChampionAssets = {
  names: {},
  itemIcons: {},
  spellIcons: {},
  spellNames: {},
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function iconFileName(path: string): string | null {
  const fileName = path.replace(/\\/g, "/").split("/").at(-1);
  if (!fileName || fileName.trim().length === 0) {
    return null;
  }
  return fileName.replace(/\.(dds|tex|jpg|jpeg|webp)$/i, ".png");
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function consumeCollection<T>(
  collection: T[] | Record<string, T> | null,
  consume: (entry: T, idFromKey: number | null) => void,
) {
  if (Array.isArray(collection)) {
    for (const entry of collection) {
      consume(entry, null);
    }
    return;
  }
  if (!collection) {
    return;
  }
  for (const [key, entry] of Object.entries(collection)) {
    consume(entry, asNumber(key));
  }
}

async function loadChampionAssets(): Promise<ChampionAssets> {
  const [champions, items, spells] = await Promise.all([
    fetchJson<ChampionSummaryEntry[] | Record<string, ChampionSummaryEntry>>(
      CDRAGON_ZH_CN_SUMMARY,
    ),
    fetchJson<ItemEntry[] | Record<string, ItemEntry>>(
      `${CDRAGON_GAME_DATA_BASE}/v1/items.json`,
    ),
    fetchJson<SpellEntry[] | Record<string, SpellEntry>>(
      `${CDRAGON_GAME_DATA_BASE}/v1/summoner-spells.json`,
    ),
  ]);

  const names: Record<number, string> = {};
  consumeCollection(champions, (entry, idFromKey) => {
    const id = asNumber(entry.id) ?? idFromKey;
    const name = entry.name?.trim();
    if (id !== null && id > 0 && name) {
      names[id] = name;
    }
  });

  const itemIcons: Record<number, string> = {};
  consumeCollection(items, (entry, idFromKey) => {
    const id = asNumber(entry.id) ?? idFromKey;
    const fileName = entry.iconPath ? iconFileName(entry.iconPath) : null;
    if (id === null || !fileName) {
      return;
    }
    itemIcons[id] =
      `${CDRAGON_GAME_DATA_BASE}/assets/items/icons2d/${encodeURI(fileName.toLowerCase())}`;
  });

  const spellIcons: Record<number, string> = {};
  const spellNames: Record<number, string> = {};
  consumeCollection(spells, (entry, idFromKey) => {
    const id = asNumber(entry.id) ?? idFromKey;
    const fileName = entry.iconPath ? iconFileName(entry.iconPath) : null;
    if (id === null || !fileName) {
      return;
    }
    spellIcons[id] =
      `${CDRAGON_GAME_DATA_BASE}/data/spells/icons2d/${encodeURI(fileName.toLowerCase())}`;
    const name = entry.name?.trim();
    if (name) {
      spellNames[id] = name;
    }
  });

  return { names, itemIcons, spellIcons, spellNames };
}

export function championIconUrl(championId: number): string {
  return `${CDRAGON_GAME_DATA_BASE}/v1/champion-icons/${championId}.png`;
}

export function useChampionAssets() {
  const query = createSolidQuery<ChampionAssets>(
    () => "champions:cdragon-assets",
    () => loadChampionAssets(),
    { initialValue: EMPTY_ASSETS, keepPreviousData: true },
  );

  return createMemo(() => query.data() ?? EMPTY_ASSETS);
}
