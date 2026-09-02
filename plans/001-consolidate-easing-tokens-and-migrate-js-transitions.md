# 001 — Consolidate easing tokens and migrate JS inline transitions to CSS

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: HIGH
- **Category**: 2 (Easing & duration) + 7 (Cohesion & tokens)
- **Estimated scope**: 3 files (css/main.css, js/testimonials.js, js/utils.js)

## Problem

**1. Weak/non-standard easing tokens** (`css/main.css:53-57`):
```css
/* css/main.css:53-57 — current */
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
```

Per AUDIT.md, standard tokens should be:
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out for UI entrances)
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` (strong ease-in-out for on-screen movement)
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` (iOS-like drawer curve)

Current `--ease-smooth` is weak (close to default `ease`). `--ease-spring` has bounce (1.56 > 1) — keep as `--ease-bounce` for playful moments only. `--ease-out` and `--ease-in-out` are close but not exact AUDIT.md values.

**2. JS inline transitions bypass tokens** (`js/testimonials.js:49,55`):
```javascript
// js/testimonials.js:49 — current
currentTestimonial.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

// js/testimonials.js:55 — current
newTestimonial.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
```

Bare `ease` = `cubic-bezier(0.25, 0.1, 0.25, 1)` — weak, not using design system. Duration 0.4s exceeds 300ms UI budget.

**3. Hardcoded stagger delays** (`js/scroll-reveal.js:45,51,57`):
```javascript
// js/scroll-reveal.js:45
item.style.transitionDelay = `${Math.min(index * 80, 400)}ms`;

// js/scroll-reveal.js:51
pillar.style.transitionDelay = `${index * 120}ms`;

// js/scroll-reveal.js:57
card.style.transitionDelay = `${index * 60}ms`;
```

Magic numbers should be configurable.

## Target

### CSS Tokens (`css/main.css:53-57`):
```css
/* target */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI entrances/exits */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);  /* playful bounce — reserve for rare delight */
--duration-fast: 160ms;                             /* button press, tooltips */
--duration-base: 250ms;                             /* dropdowns, reveals */
--duration-slow: 400ms;                             /* modals, marketing entrances */
--stagger-delay: 60ms;                              /* base stagger for group entrances */
```

### Testimonials CSS-driven (`css/main.css` — add new rules):
```css
/* target */
.testimonial {
  opacity: 0;
  transform: translateX(40px);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
  pointer-events: none;
}

.testimonial.is-active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* Direction-aware entrance — next slides from right, prev from left */
.testimonial[data-direction="next"] {
  transform: translateX(40px);
}
.testimonial[data-direction="prev"] {
  transform: translateX(-40px);
}
```

### Scroll reveal stagger via CSS (`css/main.css`):
```css
/* target — use nth-child for stagger, or keep JS but use token */
.reveal:nth-child(1) { transition-delay: calc(var(--stagger-delay) * 1); }
.reveal:nth-child(2) { transition-delay: calc(var(--stagger-delay) * 2); }
.reveal:nth-child(3) { transition-delay: calc(var(--stagger-delay) * 3); }
.reveal:nth-child(4) { transition-delay: calc(var(--stagger-delay) * 4); }
.reveal:nth-child(5) { transition-delay: calc(var(--stagger-delay) * 5); }
.reveal:nth-child(6) { transition-delay: calc(var(--stagger-delay) * 6); }
.reveal:nth-child(7) { transition-delay: calc(var(--stagger-delay) * 7); }
/* Cap at 400ms via min() if needed */
```

## Repo conventions to follow

- Easing/duration tokens live in `css/main.css:1` (root `:root` block) — add new tokens there
- Exemplar: `--color-primary: #3D1766;` pattern for token definition
- JS modules import `checkReducedMotion` from `utils.js` — keep that pattern
- Testimonials carousel already uses CSS classes for state (`.is-active`) — extend this pattern

## Steps

1. **Update CSS tokens** in `css/main.css:53-57` — replace 5 tokens with 8 standard tokens (3 easing + 3 duration + 1 stagger)

2. **Add testimonial animation CSS** in `css/main.css` (after existing `.testimonial` rules, ~line 1280):
   - Base `.testimonial` state (hidden, translated)
   - `.testimonial.is-active` state (visible, at origin)
   - Direction variants `[data-direction="next"]`, `[data-direction="prev"]`
   - Use `var(--duration-base)` and `var(--ease-out)`

3. **Refactor `js/testimonials.js`** — remove inline `style.transition` assignments (lines 49, 55), replace with class toggles:
   - Set `data-direction` attribute on new testimonial before activating
   - Toggle `.is-active` class only
   - Use `transitionend` event for cleanup instead of `setTimeout`

4. **Update `js/scroll-reveal.js`** — replace hardcoded stagger values with `var(--stagger-delay)` via CSS custom property or imported constant:
   - Option A: Set `--stagger-delay` on container, use `calc(var(--stagger-delay) * index)` in JS
   - Option B: Move stagger to CSS `nth-child` rules (preferred — no JS needed)

5. **Add reduced-motion overrides** for new tokens in `css/main.css` (in existing `@media (prefers-reduced-motion: reduce)` block):
   ```css
   @media (prefers-reduced-motion: reduce) {
     .testimonial {
       transition-duration: 0.01ms;
     }
     .reveal {
       transition-delay: 0ms !important;
     }
   }
   ```

## Boundaries

- Do NOT touch `js/hero.js` (Three.js uses lerp, not CSS transitions)
- Do NOT touch `js/navigation.js` (uses `smoothScrollTo` from utils, not CSS transitions)
- Do NOT change HTML markup — only CSS and JS motion properties
- Do NOT add new dependencies

## Verification

- **Mechanical**: No lint/typecheck (vanilla JS/CSS). Verify no console errors on load.
- **Feel check**:
  - Open page, scroll to testimonials — click next/prev rapidly (5x in 1s). Confirm:
    - No animation queue buildup (transitions retarget smoothly)
    - No visual glitches or stuck states
    - Dots update correctly
  - In DevTools Animations panel, set playback to 10%:
    - Verify entrance uses `--ease-out` (fast start, slow end)
    - Verify movement uses `--ease-in-out` (smooth both ends)
  - Toggle `prefers-reduced-motion` (Rendering panel):
    - Testimonials switch instantly, no movement
    - Scroll reveals appear instantly, no stagger delay
  - Resize viewport — confirm no layout shift from transitions
- **Done when**:
  - All `ease` keywords replaced with `var(--ease-*)` tokens
  - No inline `style.transition` in `testimonials.js`
  - Stagger delays use `--stagger-delay` token
  - Reduced motion works for all new transitions