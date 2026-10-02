import type { LocaleResource } from "@/i18n/types";

const championsCopy = {
  title: {
    en: "Champions",
    "zh-CN": "英雄",
    "ja-JP": "チャンピオン",
  },
  source: {
    en: "OP.GG global ranked, patch {{version}}",
    "zh-CN": "OP.GG 全球排位，版本 {{version}}",
    "ja-JP": "OP.GG グローバルランク、パッチ {{version}}",
  },
  search: {
    en: "Search champions",
    "zh-CN": "搜索英雄",
    "ja-JP": "チャンピオンを検索",
  },
  allPositions: { en: "All", "zh-CN": "全部", "ja-JP": "すべて" },
  overview: {
    en: "Champion overview",
    "zh-CN": "英雄概览",
    "ja-JP": "チャンピオン概要",
  },
  champion: { en: "Champion", "zh-CN": "英雄", "ja-JP": "チャンピオン" },
  gameCount: { en: "Games", "zh-CN": "场次", "ja-JP": "試合数" },
  builds: {
    en: "Recommended build",
    "zh-CN": "推荐出装",
    "ja-JP": "おすすめビルド",
  },
  buildType: { en: "Build", "zh-CN": "出装方案", "ja-JP": "ビルド" },
  buildAlternative: {
    en: "Option {{number}}",
    "zh-CN": "方案 {{number}}",
    "ja-JP": "候補 {{number}}",
  },
  matchups: { en: "Matchups", "zh-CN": "对位表现", "ja-JP": "マッチアップ" },
  skillPriority: {
    en: "Max priority",
    "zh-CN": "升级优先级",
    "ja-JP": "優先順位",
  },
  skillLevels: {
    en: "Order by level",
    "zh-CN": "逐级加点",
    "ja-JP": "レベル別の取得順",
  },
  level: {
    en: "Level {{level}}",
    "zh-CN": "等级 {{level}}",
    "ja-JP": "レベル {{level}}",
  },
  noData: {
    en: "No data available",
    "zh-CN": "暂无数据",
    "ja-JP": "データがありません",
  },
  emptyHint: {
    en: "Try another name or position.",
    "zh-CN": "试试其他名称或位置。",
    "ja-JP": "別の名前やポジションをお試しください。",
  },
  winRate: { en: "Win rate", "zh-CN": "胜率", "ja-JP": "勝率" },
  pickRate: { en: "Pick rate", "zh-CN": "选取率", "ja-JP": "ピック率" },
  banRate: { en: "Ban rate", "zh-CN": "禁用率", "ja-JP": "バン率" },
  tier: {
    en: "Tier {{tier}}",
    "zh-CN": "{{tier}} 梯队",
    "ja-JP": "ティア {{tier}}",
  },
  games: {
    en: "{{count}} games",
    "zh-CN": "{{count}} 场",
    "ja-JP": "{{count}} 試合",
  },
  loading: {
    en: "Loading OP.GG",
    "zh-CN": "正在读取 OP.GG",
    "ja-JP": "OP.GG を読み込み中",
  },
  loadFailed: {
    en: "Could not load OP.GG champion data",
    "zh-CN": "没能读到 OP.GG 的英雄数据",
    "ja-JP": "OP.GG のチャンピオンデータを読み込めませんでした",
  },
  detailFailed: {
    en: "Could not load this champion",
    "zh-CN": "这个英雄的数据没能读出来",
    "ja-JP": "このチャンピオンのデータを読み込めませんでした",
  },
  empty: {
    en: "No champions match",
    "zh-CN": "没有符合的英雄",
    "ja-JP": "一致するチャンピオンがありません",
  },
  strong: { en: "Strong against", "zh-CN": "克制", "ja-JP": "有利" },
  weak: { en: "Weak against", "zh-CN": "被克制", "ja-JP": "不利" },
  skills: { en: "Skill order", "zh-CN": "加点", "ja-JP": "スキル順" },
  spells: {
    en: "Summoner spells",
    "zh-CN": "召唤师技能",
    "ja-JP": "サモナースペル",
  },
  starter: { en: "Starter", "zh-CN": "出门装", "ja-JP": "初期アイテム" },
  boots: { en: "Boots", "zh-CN": "鞋子", "ja-JP": "ブーツ" },
  core: { en: "Core build", "zh-CN": "核心出装", "ja-JP": "コアビルド" },
  situational: {
    en: "Later items",
    "zh-CN": "后期装备",
    "ja-JP": "後期アイテム",
  },
} as const;

const positions = {
  TOP: { en: "Top", "zh-CN": "上单", "ja-JP": "トップ" },
  JUNGLE: { en: "Jungle", "zh-CN": "打野", "ja-JP": "ジャングル" },
  MID: { en: "Mid", "zh-CN": "中单", "ja-JP": "ミッド" },
  ADC: { en: "Bot", "zh-CN": "下路", "ja-JP": "ボット" },
  SUPPORT: { en: "Support", "zh-CN": "辅助", "ja-JP": "サポート" },
} as const;

function localeTree(locale: "en" | "zh-CN" | "ja-JP") {
  return {
    nav: { champions: championsCopy.title[locale] },
    champions: {
      title: championsCopy.title[locale],
      source: championsCopy.source[locale],
      search: championsCopy.search[locale],
      allPositions: championsCopy.allPositions[locale],
      overview: championsCopy.overview[locale],
      champion: championsCopy.champion[locale],
      gameCount: championsCopy.gameCount[locale],
      builds: championsCopy.builds[locale],
      buildType: championsCopy.buildType[locale],
      buildAlternative: championsCopy.buildAlternative[locale],
      matchups: championsCopy.matchups[locale],
      skillPriority: championsCopy.skillPriority[locale],
      skillLevels: championsCopy.skillLevels[locale],
      level: championsCopy.level[locale],
      noData: championsCopy.noData[locale],
      emptyHint: championsCopy.emptyHint[locale],
      winRate: championsCopy.winRate[locale],
      pickRate: championsCopy.pickRate[locale],
      banRate: championsCopy.banRate[locale],
      tier: championsCopy.tier[locale],
      games: championsCopy.games[locale],
      loading: championsCopy.loading[locale],
      loadFailed: championsCopy.loadFailed[locale],
      detailFailed: championsCopy.detailFailed[locale],
      empty: championsCopy.empty[locale],
      strong: championsCopy.strong[locale],
      weak: championsCopy.weak[locale],
      skills: championsCopy.skills[locale],
      spells: championsCopy.spells[locale],
      starter: championsCopy.starter[locale],
      boots: championsCopy.boots[locale],
      core: championsCopy.core[locale],
      situational: championsCopy.situational[locale],
      positions: {
        TOP: positions.TOP[locale],
        JUNGLE: positions.JUNGLE[locale],
        MID: positions.MID[locale],
        ADC: positions.ADC[locale],
        SUPPORT: positions.SUPPORT[locale],
      },
    },
  };
}

export const championsI18n: LocaleResource = {
  en: localeTree("en"),
  "zh-CN": localeTree("zh-CN"),
  "ja-JP": localeTree("ja-JP"),
};
