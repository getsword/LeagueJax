import {
  type BaseTemplateArgs,
  flatten,
  resolveTemplate,
  translator,
} from "@solid-primitives/i18n";
import type { Accessor, Setter } from "solid-js";
import { createMemo, createRoot, createSignal } from "solid-js";
import type { LocaleCode, LocaleDictionary, LocaleResource } from "./types";

type FlatLocaleDictionary = Record<string, string>;

export type TranslationParams = BaseTemplateArgs & { lng?: LocaleCode };
export type SolidTranslate = (
  key: string,
  params?: TranslationParams,
) => string;

export interface SolidI18nController {
  language: Accessor<LocaleCode>;
  resources: Accessor<LocaleResource>;
  setLanguage: Setter<LocaleCode>;
  setResources: Setter<LocaleResource>;
  t: SolidTranslate;
}

let controller: SolidI18nController | null = null;
let disposeController: (() => void) | null = null;

function flattenLocaleDictionary(
  resources: LocaleResource,
  language: LocaleCode,
): FlatLocaleDictionary {
  const dictionary = resources[language] ?? resources.en ?? {};
  return flatten(dictionary as LocaleDictionary) as FlatLocaleDictionary;
}

function toTranslation(value: unknown, key: string): string {
  if (typeof value === "string") {
    return value;
  }

  return key;
}

// The controller owns root-level Solid signals because i18n is initialized by
// runtime shards before any Solid component tree exists.
// Cache translators per locale so explicit language lookups do not change the
// UI language, while resource updates invalidate every cached dictionary.
export function createSolidI18n(
  initialResources: LocaleResource,
  initialLanguage: LocaleCode = "zh-CN",
): SolidI18nController {
  const [resources, setResources] = createSignal(initialResources, {
    equals: false,
  });
  const [language, setLanguage] = createSignal(initialLanguage);
  const translators = createMemo(() => {
    const currentResources = resources();
    const byLanguage: Partial<Record<LocaleCode, SolidTranslate>> = {};

    for (const locale of Object.keys(currentResources) as LocaleCode[]) {
      const dictionary = flattenLocaleDictionary(currentResources, locale);
      byLanguage[locale] = translator(() => dictionary, resolveTemplate);
    }

    return byLanguage;
  });

  return {
    language,
    resources,
    setLanguage,
    setResources,
    t: (key, params) => {
      const byLanguage = translators();
      const translate = byLanguage[params?.lng ?? language()] ?? byLanguage.en;
      return toTranslation(translate?.(key, params), key);
    },
  };
}

export function initializeSolidI18n(
  resources: LocaleResource,
  language: LocaleCode = "zh-CN",
): SolidI18nController {
  if (controller) {
    controller.setResources(resources);
    controller.setLanguage(language);
    return controller;
  }

  controller = createRoot((dispose) => {
    disposeController = dispose;
    return createSolidI18n(resources, language);
  });

  return controller;
}

export function getSolidI18n(): SolidI18nController {
  if (!controller) {
    throw new Error("Solid i18n has not been initialized.");
  }

  return controller;
}

export function useSolidTranslation(): Pick<
  SolidI18nController,
  "language" | "t"
> {
  const i18n = getSolidI18n();
  return {
    language: i18n.language,
    t: i18n.t,
  };
}

export function disposeSolidI18n(): void {
  disposeController?.();
  disposeController = null;
  controller = null;
}
