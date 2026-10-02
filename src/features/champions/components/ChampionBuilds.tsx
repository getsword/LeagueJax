/** @jsxImportSource solid-js */
import { ChevronRight } from "lucide-solid";
import { createMemo, Index, Show } from "solid-js";
import type { OpggBuildDto, OpggChampionDetailDto } from "@/bindings/opgg";
import { AppTooltip } from "@/components/AppTooltip";
import { LazyImage } from "@/components/LazyImage";
import { useSolidTranslation } from "@/i18n/solid";
import { resolveSkillOrder } from "../skill-order";
import * as s from "./ChampionBuilds.css";
import * as shared from "./ChampionPresentation.css";
import { ChampionRate } from "./ChampionRate";

function ChampionSkillPriority(props: { skills: string[] }) {
  const { t } = useSolidTranslation();
  return (
    <div class={s.priority}>
      <span class={shared.sectionLabel}>{t("champions.skillPriority")}</span>
      <div class={s.priorityKeys}>
        <Index each={props.skills}>
          {(skill, index) => (
            <>
              <Show when={index > 0}>
                <ChevronRight size={12} aria-hidden="true" />
              </Show>
              <span class={s.skillKey}>{skill()}</span>
            </>
          )}
        </Index>
      </div>
    </div>
  );
}

function ChampionSkillStep(props: {
  level: number;
  skill: string | null;
  inferred: boolean;
}) {
  const { t } = useSolidTranslation();
  const tooltip = () => {
    const level = String(props.level);
    if (!props.skill) {
      return t("champions.unavailableSkillLevel", { level });
    }
    if (props.inferred) {
      return t("champions.inferredSkillLevel", { level });
    }
    return t("champions.level", { level });
  };

  return (
    <AppTooltip content={tooltip()}>
      {(triggerProps) => (
        <span
          {...triggerProps<HTMLSpanElement>({ class: s.skillStep })}
          data-ultimate={props.skill === "R"}
        >
          <span class={s.level}>{props.level}</span>
          <span>{props.skill || "—"}</span>
        </span>
      )}
    </AppTooltip>
  );
}

export function ChampionSkills(props: { detail: OpggChampionDetailDto }) {
  const { t } = useSolidTranslation();
  const skillOrder = createMemo(() => resolveSkillOrder(props.detail));
  return (
    <div class={s.skills}>
      <ChampionSkillPriority skills={props.detail.skillPriority} />
      <div class={shared.stack}>
        <span class={shared.sectionLabel}>{t("champions.skillLevels")}</span>
        <section
          class={s.skillOrder}
          aria-label="Skill order by champion level"
        >
          <Index each={skillOrder()}>
            {(skill, index) => (
              <ChampionSkillStep
                level={index + 1}
                skill={skill()}
                inferred={index >= props.detail.skillOrder.length}
              />
            )}
          </Index>
        </section>
      </div>
      <div class={s.skillStats}>
        <span>
          <span class={shared.muted}>{t("champions.winRate")} </span>
          <ChampionRate value={props.detail.skillWinRate} />
        </span>
        <span>
          <span class={shared.muted}>{t("champions.pickRate")} </span>
          <ChampionRate value={props.detail.skillPickRate} neutral />
        </span>
      </div>
    </div>
  );
}

function ItemIcon(props: { src: string | null }) {
  return (
    <Show
      when={props.src}
      fallback={<span class={s.icon} aria-hidden="true" />}
    >
      {(src) => (
        <LazyImage
          src={src()}
          alt=""
          className={s.icon}
          fallbackClassName={s.icon}
        />
      )}
    </Show>
  );
}

function ChampionBuildLine(props: {
  label: string;
  build: OpggBuildDto | undefined;
  icon: (id: number) => string | null;
}) {
  return (
    <Show when={props.build}>
      {(build) => (
        <div class={s.buildRow}>
          <span class={`${shared.sectionLabel} ${s.buildLabel}`}>
            {props.label}
          </span>
          <div class={s.icons}>
            <Index each={build().ids}>
              {(id) => <ItemIcon src={props.icon(id())} />}
            </Index>
          </div>
          <span class={s.buildRate}>
            <ChampionRate value={build().winRate} />
          </span>
        </div>
      )}
    </Show>
  );
}

export function ChampionBuilds(props: {
  detail: OpggChampionDetailDto;
  itemIcon: (id: number) => string | null;
  spellIcon: (id: number) => string | null;
}) {
  const { t } = useSolidTranslation();
  return (
    <div class={s.content}>
      <div class={s.buildHeading}>
        <span class={shared.sectionLabel}>{t("champions.buildType")}</span>
        <span class={shared.sectionLabel}>{t("champions.winRate")}</span>
      </div>
      <div class={s.builds}>
        <ChampionBuildLine
          label={t("champions.spells")}
          build={props.detail.summonerSpells[0]}
          icon={props.spellIcon}
        />
        <ChampionBuildLine
          label={t("champions.starter")}
          build={props.detail.starterItems[0]}
          icon={props.itemIcon}
        />
        <ChampionBuildLine
          label={t("champions.boots")}
          build={props.detail.boots[0]}
          icon={props.itemIcon}
        />
        <Index each={props.detail.coreItems.slice(0, 2)}>
          {(build, index) => (
            <ChampionBuildLine
              label={
                index === 0
                  ? t("champions.core")
                  : t("champions.buildAlternative", {
                      number: String(index + 1),
                    })
              }
              build={build()}
              icon={props.itemIcon}
            />
          )}
        </Index>
      </div>
      <Show when={props.detail.lastItems.length > 0}>
        <div class={s.later}>
          <h3 class={shared.sectionLabel}>{t("champions.situational")}</h3>
          <div class={s.icons}>
            <Index each={props.detail.lastItems}>
              {(build) => (
                <ItemIcon src={props.itemIcon(build().ids[0] ?? 0)} />
              )}
            </Index>
          </div>
        </div>
      </Show>
    </div>
  );
}
