# 008 — First Testimonial Entrance Animation

- **Status**: TODO
- **Commit**: deba5a1
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Preventing a jarring change
- **Estimated scope**: 1 file (testimonials.js), ~5 lines CSS + 5 lines JS

## Problem

The first testimonial snaps in instantly on page load because `.is-active` is added synchronously in `initTestimonials()`. There's no entrance animation — it just appears at full opacity/position.

**Current code** (`js/testimonials.js:180-185`):
```javascript
// Initialize first testimonial
testimonials[0].classList.add('is-active');
announceSlide(0);
```

The CSS for `.testimonial` (`css/main.css:968-979`) already defines the entrance transition:
```css
.testimonial {
  /* ... */
  opacity: 0;
  transform: translateX(40px);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
  /* ... */
}

.testimonial.is-active {
  opacity: 1;
  transform: translateX(0);
  position: relative;
  pointer-events: auto;
}
```

But since `.is-active` is added before the first paint, the transition never runs — the element starts at the end state.

## Target

Defer adding `.is-active` until after the first paint so the browser has a chance to establish the initial state (opacity: 0, transform: translateX(40px)) and then transition to the active state.

```javascript
// Initialize first testimonial — defer to next frame for entrance animation
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    testimonials[0].classList.add('is-active');
    announceSlide(0);
  });
});
```

Double `requestAnimationFrame` ensures:
1. First RAF: browser paints initial state (opacity: 0, transform: translateX(40px))
2. Second RAF: class added, transition runs

This is the standard pattern for CSS entrance animations on mount.

## Repo conventions to follow

- CSS transitions already defined in `css/main.css:968-979` using `--duration-base: 250ms` and `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
- Direction-aware entrance via `data-direction` attribute (already handled by `goToSlide`)
- Reduced motion handled globally (`css/main.css:116-147`) + testimonial-specific handler (`testimonials.js:188-202`) sets transition to 0.01ms
- No new CSS needed — existing styles work once timing is fixed

## Steps

1. **Update `js/testimonials.js:180-185`** — wrap `.is-active` addition and `announceSlide(0)` in double `requestAnimationFrame`.
2. **Verify** the first testimonial now slides in from the right (translateX 40px → 0) over 250ms ease-out on page load.

## Boundaries

- Do NOT change the testimonial CSS (already correct).
- Do NOT change `goToSlide` or subsequent slide transitions (already work correctly).
- Do NOT add new CSS classes or keyframes.
- This is a 3-line JS change only.

## Verification

- **Mechanical**: No console errors on page load.
- **Feel check**:
  - Fresh page load → first testimonial slides in from right (40px) over 250ms ease-out.
  - Subsequent carousel navigation still works (direction-aware, interruptible).
  - DevTools Animations at 10%: confirm ease-out curve, 250ms duration.
  - Toggle `prefers-reduced-motion` → instant appearance (handled by existing reduced-motion listener).
- **Done when**: First testimonial has entrance animation matching subsequent slide entrances.