# Animation Improvement Plans

Generated from `improve-animations` audit at commit `deba5a1`.

## Execution Order

| # | Plan | Severity | Dependencies | Status |
|---|------|----------|--------------|--------|
| 1 | [001-consolidate-easing-tokens-and-migrate-js-transitions.md](001-consolidate-easing-tokens-and-migrate-js-transitions.md) | HIGH | None | DONE |
| 2 | [002-fix-carousel-interruptibility.md](002-fix-carousel-interruptibility.md) | HIGH | **Requires 001** (CSS tokens + testimonial CSS) | DONE |
| 3 | [003-pause-hero-raf-when-offscreen.md](003-pause-hero-raf-when-offscreen.md) | HIGH | None | DONE |
| 4 | [004-reduce-scroll-reveal-duration.md](004-reduce-scroll-reveal-duration.md) | MEDIUM | **Requires 001** (tokens) | DONE |
| 5 | [005-fix-nav-underline-layout-thrash.md](005-fix-nav-underline-layout-thrash.md) | MEDIUM | **Requires 001** (tokens) | DONE |
| 6 | [006-form-success-entrance.md](006-form-success-entrance.md) | HIGH | None (uses existing tokens) | DONE |
| 7 | [007-validation-error-entrance.md](007-validation-error-entrance.md) | MEDIUM | None (uses existing tokens) | DONE |
| 8 | [008-first-testimonial-entrance.md](008-first-testimonial-entrance.md) | MEDIUM | None (uses existing testimonial CSS) | DONE |
| 9 | [009-button-press-feedback.md](009-button-press-feedback.md) | HIGH | None (uses existing tokens) | DONE |
| 10 | [010-nav-scrolled-transition-token-fix.md](010-nav-scrolled-transition-token-fix.md) | HIGH | None (uses existing tokens) | DONE |

## Dependency Graph

```
001 (tokens) ──► 002 (carousel CSS)
    │
    ├─► 004 (reveal duration)
    │
    └─► 005 (nav underline)

003 (hero rAF) — independent, can run in parallel

006 (form success) — independent, uses existing tokens
007 (validation error) — independent, uses existing tokens
008 (first testimonial) — independent, uses existing testimonial CSS
009 (button press) — independent, uses existing tokens
010 (nav token fix) — independent, uses existing tokens
```

## Notes

- **Plan 001 is foundational** — it defines the token system (`--ease-out`, `--duration-base`, `--stagger-delay`, etc.) that Plans 002, 004, 005 depend on. Execute it first.
- **Plan 002 requires Plan 001's CSS** — the testimonial animation CSS (`.testimonial`, `.is-active`, `data-direction` variants) must exist before the JS refactor works.
- **Plans 004 and 005** can be done after 001, in any order.
- **Plan 003** is fully independent — can be executed anytime, even in parallel with others.
- **Plans 006–010** (new from opportunities report) are all independent of 001–005 and each other — they use the *existing* token system that's already in `css/main.css`. Can be executed in any order, even before 001.

## Recommended Execution Sequence

### Phase 1: Foundation (do first)
1. **Execute 001** — Update tokens, add testimonial CSS, update scroll-reveal stagger
2. **Execute 002** — Refactor carousel JS (now uses CSS from 001)
3. **Execute 003** — Add hero visibility observer (independent)
4. **Execute 004** — Reduce reveal duration (uses 001 tokens)
5. **Execute 005** — Fix nav underline (uses 001 tokens)

### Phase 2: Polish opportunities (can run in parallel with Phase 1, or after)
6. **Execute 006** — Form success message entrance
7. **Execute 007** — Validation error message entrance
8. **Execute 008** — First testimonial entrance animation
9. **Execute 009** — Button press feedback (scale on :active)
10. **Execute 010** — Nav scrolled transition token fix

## Verification Checklist (post-execution)

- [ ] All `ease` keywords replaced with `var(--ease-*)` tokens
- [ ] No inline `style.transition` in any JS file
- [ ] Carousel: rapid clicks never ignored, transitions retarget smoothly
- [ ] Hero rAF pauses when off-screen, resumes instantly
- [ ] Scroll reveals at 250ms with `--ease-out`
- [ ] Nav underline uses `transform: scaleX()` from left origin
- [ ] `prefers-reduced-motion` works for all animations
- [ ] `@media (hover: hover) and (pointer: fine)` guards on hover animations
- [ ] No `transition: all` anywhere in CSS
- [ ] DevTools Performance: no layout thrash on hover/nav interactions
- [ ] **NEW**: Form success message enters with `@starting-style` (scale 0.95 → 1, 250ms ease-out)
- [ ] **NEW**: Validation errors slide down from -4px (160ms ease-out)
- [ ] **NEW**: First testimonial slides in from right on page load (250ms ease-out)
- [ ] **NEW**: All `.btn` elements scale to 0.97 on press (160ms ease-out)
- [ ] **NEW**: Nav scrolled transition animates (250ms ease-out)