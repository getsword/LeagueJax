import type { LucideIcon } from "lucide-solid";
import type { Component } from "solid-js";

export interface MiniTabPageProps {
  active: boolean;
}

export interface MiniTabAvailability {
  enabled: boolean;
  reasonKey?: string;
}

export interface MiniTabDefinition {
  id: string;
  titleKey: string;
  ariaLabel: string;
  icon: LucideIcon;
  order: number;
  availability?: () => MiniTabAvailability;
  component: Component<MiniTabPageProps>;
}

export interface MiniTabEntry extends MiniTabAvailability {
  definition: MiniTabDefinition;
  id: string;
}
