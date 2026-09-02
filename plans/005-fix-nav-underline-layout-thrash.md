# 005 — Fix nav underline: replace width transition with transform scaleX

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: MEDIUM
- **Category**: 3 (Physicality & origin) + 5 (Performance)
- **Estimated scope**: 1 file (css/main.css)

## Problem

**Nav underline animates `width` — triggers layout** (`css/main.css:1149` and surrounding):
```css
/* css/main.css:1145-1155 — current (approximate location) */
.nav__link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transition: width 0.3s var(--ease-smooth);  /* LAYOUT THRASH */
}

.nav__link--active::after,
.nav__link:hover::after {
  width: 100%;
}
```

Animating `width` forces layout recalculation on every frame (layout → paint → composite). Per AUDIT.md: "Animate `transform` and `opacity` only. `width`/`height`/`margin`/`padding`/`top`/`left` trigger layout + paint + composite."

Also, `transform-origin` defaults to center, but underline should scale from left (trigger edge) — AUDIT.md: "Popovers/dropdowns/tooltips scale from their trigger, not center."

## Target

**GPU-accelerated underline with left-origin scale** (`css/main.css`):
```css
/* target */
.nav__link {
  position: relative;
}

.nav__link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;  /* Scale from LEFT (trigger edge) */
  transition: transform var(--duration-fast) var(--ease-out);
  /* Where --duration-fast: 160ms, --ease-out: cubic-bezier(0.23, 1, 0.32, 1) */
}

.nav__link--active::after,
.nav__link:hover::after {
  transform: scaleX(1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nav__link::after {
    transition-duration: 0.01ms;
  }
}

/* Touch devices — no hover animation */
@media (hover: hover) and (pointer: fine) {
  .nav__link:hover::after {
    transform: scaleX(1);
  }
}
```

## Repo conventions to follow

- Tokens from Plan 001: `--duration-fast` (160ms), `--ease-out` (0.23, 1, 0.32, 1)
- Existing nav styles in `css/main.css` around line 1130-1160
- `nav__link--active` class toggled by `js/navigation.js:68`
- Hover guard: `@media (hover: hover) and (pointer: fine)` per AUDIT.md

## Steps

1. **Locate current nav underline styles** in `css/main.css` (search for `.nav__link::after`)

2. **Replace `width` animation with `transform: scaleX()`**:
   - Set `width: 100%` on `::after` (always full width)
   - Use `transform: scaleX(0)` as default (hidden)
   - Set `transform-origin: left center`
   - Transition `transform` with `var(--duration-fast) var(--ease-out)`

3. **Update active/hover states** to use `transform: scaleX(1)`

4. **Add reduced-motion override** in existing `@media (prefers-reduced-motion: reduce)` block

5. **Add hover media query guard** to prevent false hovers on touch

## Boundaries

- Do NOT modify `js/navigation.js` — it only toggles `.nav__link--active` class
- Do NOT change HTML markup
- Do NOT affect other nav styles (logo, container, etc.)
- This plan depends on Plan 001 tokens — if not applied, define inline first

## Verification

- **Mechanical**: No CSS syntax errors.
- **Feel check**:
  - Hover over nav links (desktop):
    - Underline slides in from LEFT (not center)
    - Feels crisp, 160ms — snappy
  - Click nav link, watch active state:
    - Underline appears instantly on new link (class toggle)
    - Previous link's underline scales out from left
  - In DevTools Performance tab, record hover interaction:
    - Confirm NO layout recalculations (no purple "Layout" blocks)
    - Only "Composite" (green) for transform
  - In DevTools Animations panel (10% speed):
    - Verify `transform-origin: left center`
    - Verify `scaleX(0) → scaleX(1)` not `width: 0 → 100%`
  - Toggle `prefers-reduced-motion`:
    - Underline appears/disappears instantly
  - Touch device (or DevTools mobile):
    - Tap nav link — no hover animation stuck on
    - Active state still works
  - Mobile test: smooth 60fps, no jank
- **Done when**:
  - `width` transition removed, replaced with `transform: scaleX()`
  - `transform-origin: left center` set
  - Duration uses `--duration-fast` (160ms)
  - Easing uses `--ease-out`
  - Reduced motion works
  - Hover guard prevents touch false-positives