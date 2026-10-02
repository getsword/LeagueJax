import { describe, expect, test } from "bun:test";
import {
  partitionMiniTabs,
  resolveMiniTabSelection,
  sortMiniTabs,
} from "./state";

const game = { id: "game", enabled: true, order: 10 };
const counters = { id: "counters", enabled: true, order: 20 };

describe("mini page selection", () => {
  test("uses the default without activating a newly available page", () => {
    const selected = resolveMiniTabSelection(
      null,
      [game, { ...counters, enabled: false }],
      game.id,
    );
    expect(selected).toBe(game.id);
    expect(resolveMiniTabSelection(selected, [game, counters], game.id)).toBe(
      game.id,
    );
  });

  test("keeps manual selection through updates and resets only when unavailable", () => {
    let selected = resolveMiniTabSelection(
      counters.id,
      [game, counters],
      game.id,
    );
    expect(selected).toBe(counters.id);
    selected = resolveMiniTabSelection(
      selected,
      [game, { ...counters, enabled: false }],
      game.id,
    );
    expect(selected).toBe(game.id);
    expect(resolveMiniTabSelection(selected, [game, counters], game.id)).toBe(
      game.id,
    );
  });

  test("handles removed pages, unavailable defaults and an empty registry", () => {
    expect(resolveMiniTabSelection("removed", [game, counters], game.id)).toBe(
      game.id,
    );
    expect(resolveMiniTabSelection(null, [counters], game.id)).toBe(
      counters.id,
    );
    expect(
      resolveMiniTabSelection(game.id, [{ ...game, enabled: false }], game.id),
    ).toBeNull();
    expect(resolveMiniTabSelection(null, [], game.id)).toBeNull();
  });

  test("orders extensions without mutating registrations and rejects duplicate IDs", () => {
    const registrations = [counters, game];
    expect(sortMiniTabs(registrations)).toEqual([game, counters]);
    expect(registrations).toEqual([counters, game]);
    expect(() => sortMiniTabs([game, { ...game }])).toThrow(
      "Duplicate mini tab",
    );
  });

  test("keeps three fixed icon positions and exposes further pages through overflow", () => {
    const entries = ["game", "counters", "notes", "builds", "history"];
    expect(partitionMiniTabs(entries)).toEqual({
      visible: entries.slice(0, 3),
      overflow: entries.slice(3),
    });
    expect(partitionMiniTabs(entries.slice(0, 2)).overflow).toEqual([]);
  });
});
