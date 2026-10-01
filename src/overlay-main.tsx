/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import { counterOverlayI18n } from "@/features/counter-overlay/i18n";
import { languageFromSystemLocale } from "@/features/i18n/locale";
import { initializeSolidI18n } from "@/i18n/solid";
import "./styles/theme.css";
import "./styles/global.css";
import OverlayApp from "./OverlayApp";

function resolveUiPlatform(): string {
  const userAgent = navigator.userAgent;

  if (/\bWindows\b/i.test(userAgent)) {
    return "windows";
  }

  if (/\b(iPhone|iPad|iPod)\b/i.test(userAgent)) {
    return "ios";
  }

  if (/\bMacintosh\b/i.test(userAgent)) {
    return "macos";
  }

  if (/\bLinux\b/i.test(userAgent)) {
    return "linux";
  }

  return "unknown";
}

document.documentElement.dataset.platform = resolveUiPlatform();

function applySystemTheme(): void {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = (dark: boolean) => {
    root.classList.toggle("dark", dark);
  };
  apply(media.matches);
  media.addEventListener("change", (event) => apply(event.matches));
}

applySystemTheme();
initializeSolidI18n(
  counterOverlayI18n,
  languageFromSystemLocale(navigator.language),
);

const root = document.getElementById("root");
if (root) {
  render(() => <OverlayApp />, root);
}
