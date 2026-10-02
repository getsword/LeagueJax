import { describe, expect, test } from "bun:test";
import { resolveSkillOrder } from "./skill-order";

const jinxOrder = [
  "Q",
  "W",
  "E",
  "Q",
  "Q",
  "R",
  "Q",
  "W",
  "Q",
  "W",
  "W",
  "R",
  "W",
  "E",
  "E",
];
const jinx = { id: 222, skillOrder: jinxOrder, skillPriority: ["Q", "W", "E"] };

describe("champion skill order completion", () => {
  test("preserves the 15 reported levels and completes Jinx with R E E", () => {
    const original = structuredClone(jinx);
    const result = resolveSkillOrder(jinx);

    expect(result).toEqual([...jinxOrder, "R", "E", "E"]);
    expect(jinx).toEqual(original);
  });

  test("does not replace a reported delayed ultimate in a complete order", () => {
    const reported = [...jinxOrder, "E", "R", "E"];
    expect(resolveSkillOrder({ ...jinx, skillOrder: reported })).toEqual(
      reported,
    );
  });

  test("continues partial late-game data without exceeding rank caps", () => {
    expect(
      resolveSkillOrder({ ...jinx, skillOrder: [...jinxOrder, "E"] }),
    ).toEqual([...jinxOrder, "E", "R", "E"]);
    expect(
      resolveSkillOrder({ ...jinx, skillOrder: [...jinxOrder, "R", "E"] }),
    ).toEqual([...jinxOrder, "R", "E", "E"]);
  });

  test("uses three paid ultimate ranks for transform champions", () => {
    const eliseOrder = [
      "W",
      "Q",
      "E",
      "Q",
      "Q",
      "R",
      "Q",
      "W",
      "Q",
      "W",
      "R",
      "W",
      "W",
      "E",
      "E",
    ];
    expect(
      resolveSkillOrder({
        id: 60,
        skillOrder: eliseOrder,
        skillPriority: ["Q", "W", "E"],
      }),
    ).toEqual([...eliseOrder, "R", "E", "E"]);
  });

  test("allows Jayce six basic ranks without allocating a point to R", () => {
    const reported = [
      "Q",
      "W",
      "E",
      "Q",
      "Q",
      "W",
      "Q",
      "W",
      "Q",
      "W",
      "Q",
      "W",
      "W",
      "E",
      "E",
    ];
    expect(
      resolveSkillOrder({
        id: 126,
        skillOrder: reported,
        skillPriority: ["Q", "W", "E"],
      }),
    ).toEqual([...reported, "E", "E", "E"]);
  });

  test("treats Udyr R as a basic stance and follows the full priority", () => {
    const reported = [
      "Q",
      "R",
      "W",
      "E",
      "Q",
      "Q",
      "Q",
      "E",
      "Q",
      "E",
      "Q",
      "E",
      "E",
      "E",
      "W",
    ];
    expect(
      resolveSkillOrder({
        id: 77,
        skillOrder: reported,
        skillPriority: ["Q", "E", "W", "R"],
      }),
    ).toEqual([...reported, "W", "W", "W"]);
  });

  test("allows Udyr R to reach six ranks when it has priority", () => {
    const reported = [
      "Q",
      "R",
      "W",
      "E",
      "R",
      "R",
      "R",
      "W",
      "R",
      "W",
      "W",
      "W",
      "E",
      "E",
      "E",
    ];
    expect(
      resolveSkillOrder({
        id: 77,
        skillOrder: reported,
        skillPriority: ["R", "W", "E", "Q"],
      }),
    ).toEqual([...reported, "R", "W", "E"]);
  });

  test("completes unambiguous Aphelios stat points without spending on R", () => {
    const reported = [
      "Q",
      "Q",
      "Q",
      "E",
      "Q",
      "E",
      "Q",
      "E",
      "Q",
      "E",
      "E",
      "E",
      "W",
      "W",
      "W",
    ];
    expect(
      resolveSkillOrder({
        id: 523,
        skillOrder: reported,
        skillPriority: ["Q", "E", "W"],
      }),
    ).toEqual([...reported, "W", "W", "W"]);
  });

  test("keeps Aphelios source data but does not infer from automatic R entries", () => {
    const reported = [
      "Q",
      "Q",
      "Q",
      "E",
      "Q",
      "R",
      "E",
      "Q",
      "E",
      "Q",
      "E",
      "E",
      "R",
      "E",
      "W",
    ];
    expect(
      resolveSkillOrder({
        id: 523,
        skillOrder: reported,
        skillPriority: ["Q", "E", "W"],
      }),
    ).toEqual([...reported, null, null, null]);
  });

  test("reserves all 18 levels for missing or incomplete early data", () => {
    expect(resolveSkillOrder({ ...jinx, skillOrder: [] })).toEqual(
      Array(18).fill(null),
    );
    expect(resolveSkillOrder({ ...jinx, skillOrder: ["Q", "W", "E"] })).toEqual(
      ["Q", "W", "E", ...Array(15).fill(null)],
    );
    expect(
      resolveSkillOrder({ ...jinx, skillOrder: jinxOrder.slice(0, 14) }),
    ).toEqual([...jinxOrder.slice(0, 14), null, null, null, null]);
  });

  test.each([
    { skillPriority: [] },
    { skillPriority: ["Q", "W"] },
    { skillPriority: ["Q", "Q", "E"] },
    { skillPriority: ["Q", "W", "unknown"] },
    { skillPriority: ["Q", "W", "E", "R"] },
  ])(
    "does not invent a priority when it is missing or malformed: %j",
    ({ skillPriority }) => {
      expect(
        resolveSkillOrder({ ...jinx, skillPriority: [...skillPriority] }),
      ).toEqual([...jinxOrder, null, null, null]);
    },
  );

  test.each(["unknown", "", "Q", "toString"])(
    "does not infer from unknown skills or exceeded caps: %s",
    (skill) => {
      const reported = [...jinxOrder.slice(0, 14), skill];
      expect(resolveSkillOrder({ ...jinx, skillOrder: reported })).toEqual([
        ...reported,
        null,
        null,
        null,
      ]);
    },
  );

  test("limits unexpected oversized source data to the 18 displayed levels", () => {
    const reported = [...jinxOrder, "R", "E", "E", "Q"];
    expect(resolveSkillOrder({ ...jinx, skillOrder: reported })).toEqual(
      reported.slice(0, 18),
    );
  });
});
