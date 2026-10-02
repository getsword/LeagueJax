# Mini pages

Mini pages are UI contributions, independent of native window management.

1. Implement a component accepting `MiniTabPageProps`. Gate page-specific requests with `active`.
2. Export a factory returning `MiniTabDefinition` from the owning feature's mini adapter.
3. Add that factory to `createMiniTabDefinitions` in `registry.tsx`.
4. Include its translated labels in the mini runtime's i18n resources.

Create reactive selectors once in the factory; `availability` only reads them. Factories run under the mini application's Solid owner, not at module scope. Keep phase, queue and request rules in the owning feature.

The host sorts contributions by `order`, rejects duplicate IDs, displays three icons and places additional pages in the overflow menu. `ariaLabel` must be English. The title bar has no visible page name.

Newly available pages never take selection. An unavailable or removed active page falls back to the configured default, then the first enabled page. Visited pages stay mounted during tab switches; each feature resets session-specific state when its own context changes. Each page owns its full content, footer and actions. The window shell contains only the title bar and active page; game actions must not appear on unrelated pages.
