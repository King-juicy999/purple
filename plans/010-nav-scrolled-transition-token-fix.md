# 010 — Nav Scrolled Transition Token Fix

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: HIGH
- **Category**: Bug / Token consistency
- **Estimated scope**: 1 file (css/main.css), 1 line

## Problem

The `.nav.scrolled` transition references an undefined custom property `--transition-duration` which doesn't exist in the token system. The intended token is `--duration-base` (250ms) or `--duration-slow` (400ms). Currently this transition likely doesn't animate at all (invalid value = no transition).

**Current code** (`css/main.css:279`):
```css
.nav {
  /* ... */
  transition: background-color var(--transition-duration), backdrop-filter var(--transition-duration);
  /* ... */
}
```

**Token definitions** (`css/main.css:93-102`):
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

--duration-fast: 160ms;
--duration-base: 250ms;
--duration-slow: 400ms;
--stagger-delay: 60ms;
```

No `--transition-duration` exists.

## Target

Fix the token to use `--duration-base` (250ms) with `--ease-out`, matching the repo's standard UI transition pattern:

```css
/* css/main.css:279 — FIX */
.nav {
  /* ... */
  transition: background-color var(--duration-base) var(--ease-out),
              backdrop-filter var(--duration-base) var(--ease-out);
  /* ... */
}
```

This restores the intended smooth transition when the nav gains/loses the `.scrolled` class on scroll.

## Repo conventions to follow

- Token names: `--duration-base`, `--ease-out` (defined in `css/main.css:93-100`)
- All other transitions in the codebase use this pattern (e.g., `.btn` line 395-399, `.pillar` line 671-674, `.service-card` line 776-778)
- Reduced motion handled globally (`css/main.css:116-147`) — durations become 0ms

## Steps

1. **Fix `css/main.css:279`** — replace `var(--transition-duration)` with `var(--duration-base) var(--ease-out)` for both properties.
2. **Verify** nav background/blur transition works on scroll (adds/removes `.scrolled` class at 50px scroll).

## Boundaries

- Do NOT change the scroll threshold (50px in `navigation.js:23`).
- Do NOT change the `.nav.scrolled` styles (background/backdrop-filter).
- Do NOT add new tokens.
- This is a 1-line fix.

## Verification

- **Mechanical**: No CSS syntax errors.
- **Feel check**:
  - Scroll down past 50px → nav background fades in (rgba + blur) over 250ms ease-out.
  - Scroll back to top → nav background fades out over 250ms ease-out.
  - DevTools Animations at 10%: confirm 250ms, ease-out curve.
  - Toggle `prefers-reduced-motion` → instant (no transition).
- **Done when**: Nav scrolled transition uses valid tokens and animates smoothly.