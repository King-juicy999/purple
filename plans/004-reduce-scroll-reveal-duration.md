# 004 — Reduce scroll reveal duration from 0.8s to 400ms

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: MEDIUM
- **Category**: 2 (Easing & duration)
- **Estimated scope**: 1 file (css/main.css)

## Problem

**Scroll reveal transition too slow** (`css/main.css:1104`):
```css
/* css/main.css:1104 — current */
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.8s var(--ease-smooth), transform 0.8s var(--ease-smooth);
}
```

Duration 0.8s (800ms) exceeds AUDIT.md UI budget of 300ms. While marketing pages "can be longer," 800ms makes frequent scroll reveals feel sluggish — user scrolls, waits, element appears. On a page with 20+ reveal elements, this accumulates to perceived lag.

Current easing `--ease-smooth` (0.25, 0.46, 0.45, 0.94) is also weak — close to default `ease`.

## Target

**Faster, snappier reveal** (`css/main.css:1104`):
```css
/* target */
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

/* Where --duration-base: 250ms (from Plan 001) */
/* Where --ease-out: cubic-bezier(0.23, 1, 0.32, 1) (from Plan 001) */
```

**Stagger** — keep but use token (Plan 001):
```css
/* target — in @media (prefers-reduced-motion: reduce) */
@media (prefers-reduced-motion: reduce) {
  .reveal.is-visible {
    transition-duration: 0.01ms;
    transition-delay: 0ms !important;
  }
}
```

## Repo conventions to follow

- Tokens defined in `:root` (Plan 001) — use `var(--duration-base)`, `var(--ease-out)`
- Existing `.reveal` base state at `css/main.css:1098-1102`:
  ```css
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s var(--ease-smooth), transform 0.8s var(--ease-smooth);
  }
  ```
  This also needs update to use tokens.

## Steps

1. **Update `.reveal` base state** (`css/main.css:1098-1102`):
   ```css
   .reveal {
     opacity: 0;
     transform: translateY(30px);
     transition: opacity var(--duration-base) var(--ease-out),
                 transform var(--duration-base) var(--ease-out);
   }
   ```

2. **Update `.reveal.is-visible`** (`css/main.css:1104`):
   ```css
   .reveal.is-visible {
     opacity: 1;
     transform: translateY(0);
     transition: opacity var(--duration-base) var(--ease-out),
                 transform var(--duration-base) var(--ease-out);
   }
   ```

3. **Add reduced-motion override** in existing `@media (prefers-reduced-motion: reduce)` block (near end of CSS):
   ```css
   @media (prefers-reduced-motion: reduce) {
     .reveal {
       transition-duration: 0.01ms;
     }
     .reveal.is-visible {
       transition-delay: 0ms !important;
     }
   }
   ```

4. **Verify stagger still works** — `js/scroll-reveal.js` sets `transitionDelay` inline; ensure it's not overridden by CSS. The inline style has higher specificity, so it wins.

## Boundaries

- Do NOT change `js/scroll-reveal.js` logic (IntersectionObserver, stagger calculation)
- Do NOT change HTML markup
- Do NOT modify other section transitions (testimonials, hero, etc.)
- This plan depends on Plan 001 tokens existing — if Plan 001 not applied, define tokens inline first

## Verification

- **Mechanical**: No syntax errors. CSS validates.
- **Feel check**:
  - Load page, scroll down at normal reading speed:
    - Elements appear promptly as they enter viewport
    - No "waiting for animation" feeling
    - Stagger still visible (80ms/60ms/120ms delays create wave effect)
  - Scroll rapidly (page down key):
    - Elements snap into view quickly
    - No backlog of pending animations
  - In DevTools Animations panel (10% speed):
    - Verify ease-out curve: fast start, gentle end
    - Verify 250ms duration
  - Toggle `prefers-reduced-motion`:
    - All reveals instant, no stagger delay
    - Content immediately readable
  - Mobile test: scroll performance smooth, no jank
- **Done when**:
  - `.reveal` and `.reveal.is-visible` use `var(--duration-base)` and `var(--ease-out)`
  - Duration ≤ 300ms (target 250ms)
  - Reduced motion forces instant reveal
  - Stagger still functions